import google.generativeai as genai
from pinecone import Pinecone
from dotenv import load_dotenv
import os
from typing import List, Dict

load_dotenv()


class RAGService:
    def __init__(self):
        self._initialized = False
        self.index = None
        self.embed_model = "models/gemini-embedding-001"
        self.chat_model = None
        self.gemini_key = None

    def _ensure_initialized(self):
        if self._initialized:
            return

        pinecone_key = os.getenv("PINECONE_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")

        if not pinecone_key:
            raise Exception("PINECONE_API_KEY not found in environment variables!")
        if not self.gemini_key:
            raise Exception("GEMINI_API_KEY not found in environment variables!")

        genai.configure(api_key=self.gemini_key)

        pc = Pinecone(api_key=pinecone_key)
        self.index = pc.Index("intellidoc")

        self.chat_model = genai.GenerativeModel("gemini-1.5-flash")

        self._initialized = True
        print("RAG Service initialized successfully")

    def _embed_text(self, text: str) -> List[float]:
        result = genai.embed_content(
            model=self.embed_model,
            content=text,
            task_type="retrieval_query"
        )
        return result["embedding"]

    def _embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in texts:
            result = genai.embed_content(
                model=self.embed_model,
                content=text,
                task_type="retrieval_document"
            )
            embeddings.append(result["embedding"])
        return embeddings

    def add_document_to_vector_store(self, chunks: List[Dict], document_id: str):
        self._ensure_initialized()

        texts = [chunk['text'] for chunk in chunks]
        vectors = self._embed_documents(texts)

        upsert_data = []
        for i, chunk in enumerate(chunks):
            upsert_data.append({
                "id": f"{document_id}_{chunk['chunk_id']}",
                "values": vectors[i],
                "metadata": {
                    "document_id": document_id,
                    "chunk_index": chunk['chunk_id'],
                    "text": chunk['text']
                }
            })

        self.index.upsert(vectors=upsert_data)

    def _search(self, query: str, document_id: str = None, top_k: int = 3) -> List:
        query_vector = self._embed_text(query)
        filter_dict = {"document_id": {"$eq": document_id}} if document_id else None
        results = self.index.query(
            vector=query_vector,
            top_k=top_k,
            filter=filter_dict,
            include_metadata=True
        )
        return results.matches

    def _generate(self, prompt: str) -> str:
        response = self.chat_model.generate_content(prompt)
        return response.text

    def query_documents(self, question: str, document_id: str = None, top_k: int = 3) -> Dict:
        self._ensure_initialized()

        matches = self._search(question, document_id, top_k)

        if not matches:
            return {
                "answer": "I couldn't find any relevant information in this document to answer your question.",
                "sources": []
            }

        context = "\n\n".join([m.metadata.get("text", "") for m in matches])

        prompt = f"""You are a helpful AI assistant. Answer the question based on the following context.

Context:
{context}

Question: {question}
Answer: Provide a clear, concise answer based on the context. If the answer is not in the context, say "I don't have enough information to answer that."
"""

        answer_text = self._generate(prompt)

        sources = [
            {
                "text": m.metadata.get("text", "")[:200] + "...",
                "metadata": {
                    "document_id": m.metadata.get("document_id"),
                    "chunk_index": m.metadata.get("chunk_index")
                }
            }
            for m in matches
        ]

        return {"answer": answer_text, "sources": sources}

    def summarize_document(self, document_id: str) -> Dict:
        self._ensure_initialized()

        matches = self._search("summary overview main points key information", document_id, top_k=10)

        if not matches:
            from app.main import supabase
            db_chunks = supabase.table('document_chunks').select('*').eq('document_id', document_id).limit(10).execute()
            if not db_chunks.data:
                return {"summary": "This document has no content available for summarization.", "key_points": []}
            full_text = "\n\n".join([chunk['content'] for chunk in db_chunks.data])
        else:
            full_text = "\n\n".join([m.metadata.get("text", "") for m in matches])

        if len(full_text) > 30000:
            full_text = full_text[:30000] + "..."

        prompt = f"""Analyze the following document and provide:
1. A concise summary (2-3 paragraphs)
2. Key points (bullet list of 5-7 main takeaways)

Document:
{full_text}

Provide your response in this format:
SUMMARY:
[Your summary here]

KEY POINTS:
- [Point 1]
- [Point 2]
"""

        response = self._generate(prompt)

        parts = response.split("KEY POINTS:")
        summary = parts[0].replace("SUMMARY:", "").strip()
        key_points_text = parts[1].strip() if len(parts) > 1 else ""

        key_points = [
            line.strip().lstrip('-').lstrip('*').strip()
            for line in key_points_text.split('\n')
            if line.strip() and (line.strip().startswith('-') or line.strip().startswith('*'))
        ]

        return {"summary": summary, "key_points": key_points}

    def extract_entities(self, document_id: str) -> Dict:
        self._ensure_initialized()

        matches = self._search("important information dates amounts names numbers", document_id, top_k=5)

        if not matches:
            from app.main import supabase
            db_chunks = supabase.table('document_chunks').select('*').eq('document_id', document_id).limit(5).execute()
            if not db_chunks.data:
                return {"entities": {"dates": [], "amounts": [], "names": [], "other": []}}
            text = "\n\n".join([chunk['content'] for chunk in db_chunks.data])
        else:
            text = "\n\n".join([m.metadata.get("text", "") for m in matches])

        if len(text) > 20000:
            text = text[:20000] + "..."

        prompt = f"""Extract the following information from this document:
- Dates, Amounts, Names, Other important entities

Document:
{text}

Return in this format:
DATES:
- [Date 1]
AMOUNTS:
- [Amount 1]
NAMES:
- [Name 1]
OTHER:
- [Entity 1]
"""

        response = self._generate(prompt)

        entities = {"dates": [], "amounts": [], "names": [], "other": []}
        current_category = None

        for line in response.split('\n'):
            line = line.strip()
            if line.startswith('DATES:'):
                current_category = 'dates'
            elif line.startswith('AMOUNTS:'):
                current_category = 'amounts'
            elif line.startswith('NAMES:'):
                current_category = 'names'
            elif line.startswith('OTHER:'):
                current_category = 'other'
            elif line and (line.startswith('-') or line.startswith('*')) and current_category:
                item = line.lstrip('-').lstrip('*').strip()
                if item:
                    entities[current_category].append(item)

        return {"entities": entities}


rag_service = RAGService()