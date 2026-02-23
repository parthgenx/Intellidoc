from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from dotenv import load_dotenv
import os
from typing import List, Dict

load_dotenv()


class RAGService:
    def __init__(self):
        self._initialized = False
        self.index = None
        self.embeddings = None
        self.vector_store = None
        self.llm = None

    def _ensure_initialized(self):
        if self._initialized:
            return

        pinecone_key = os.getenv("PINECONE_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY")

        if not pinecone_key:
            raise Exception("PINECONE_API_KEY not found in environment variables!")
        if not gemini_key:
            raise Exception("GEMINI_API_KEY not found in environment variables!")

        pc = Pinecone(api_key=pinecone_key)
        self.index = pc.Index("intellidoc")

        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=768,
            google_api_key=gemini_key
        )

        self.vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings
        )

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=gemini_key,
            temperature=0.3
        )

        self._initialized = True

    def add_document_to_vector_store(self, chunks: List[Dict], document_id: str):
        self._ensure_initialized()

        texts = []
        metadatas = []
        ids = []

        for chunk in chunks:
            texts.append(chunk['text'])
            metadatas.append({
                'document_id': document_id,
                'chunk_index': chunk['chunk_id']
            })
            ids.append(f"{document_id}_{chunk['chunk_id']}")

        self.vector_store.add_texts(
            texts=texts,
            metadatas=metadatas,
            ids=ids
        )

    def query_documents(self, question: str, document_id: str = None, top_k: int = 3) -> Dict:
        self._ensure_initialized()

        filter_dict = {"document_id": document_id} if document_id else None

        docs = self.vector_store.similarity_search(
            question,
            k=top_k,
            filter=filter_dict
        )

        if len(docs) == 0:
            return {
                "answer": "I couldn't find any relevant information in this document to answer your question.",
                "sources": []
            }

        context = "\n\n".join([doc.page_content for doc in docs])

        prompt = f"""You are a helpful AI assistant. Answer the question based on the following context.

Context:
{context}

Question: {question}
Answer: Provide a clear, concise answer based on the context. If the answer is not in the context, say "I don't have enough information to answer that."
"""

        response = self.llm.invoke(prompt)
        if hasattr(response, 'content'):
            if isinstance(response.content, str):
                answer_text = response.content
            elif isinstance(response.content, list):
                answer_text = ''.join([part.get('text', '') if isinstance(part, dict) else str(part) for part in response.content])
            else:
                answer_text = str(response.content)
        elif isinstance(response, str):
            answer_text = response
        else:
            response_str = str(response)
            import re
            text_match = re.search(r'"text"\s*:\s*"([^"]*)"', response_str)
            answer_text = text_match.group(1) if text_match else response_str

        answer_text = answer_text.replace('\\n', '\n').replace('\\"', '"')

        sources = [
            {
                "text": doc.page_content[:200] + "...",
                "metadata": doc.metadata
            }
            for doc in docs
        ]

        return {
            "answer": answer_text,
            "sources": sources
        }

    def summarize_document(self, document_id: str) -> Dict:
        self._ensure_initialized()

        docs = self.vector_store.similarity_search(
            "summary overview main points key information",
            k=10,
            filter={"document_id": document_id}
        )

        if len(docs) == 0:
            all_docs = self.vector_store.similarity_search("summary overview", k=50)
            docs = [doc for doc in all_docs if doc.metadata.get('document_id') == document_id][:10]

        if len(docs) == 0:
            from app.main import supabase
            db_chunks = supabase.table('document_chunks').select('*').eq('document_id', document_id).limit(10).execute()
            if len(db_chunks.data) == 0:
                return {
                    "summary": "This document has no content available for summarization.",
                    "key_points": []
                }
            full_text = "\n\n".join([chunk['content'] for chunk in db_chunks.data])
        else:
            full_text = "\n\n".join([doc.page_content for doc in docs])

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
...
"""

        try:
            response = self.llm.predict(prompt)
        except Exception:
            response = self.llm.invoke(prompt)
            if hasattr(response, 'content'):
                if isinstance(response.content, str):
                    response = response.content
                elif isinstance(response.content, list):
                    response = ''.join([
                        part.get('text', '') if isinstance(part, dict) else str(part)
                        for part in response.content
                    ])
                else:
                    response = str(response.content)
            else:
                response = str(response)

        if not isinstance(response, str):
            response = str(response)

        parts = response.split("KEY POINTS:")
        summary = parts[0].replace("SUMMARY:", "").strip()
        key_points_text = parts[1].strip() if len(parts) > 1 else ""

        key_points = [
            line.strip().lstrip('-').lstrip('*').strip()
            for line in key_points_text.split('\n')
            if line.strip() and (line.strip().startswith('-') or line.strip().startswith('*'))
        ]

        return {
            "summary": summary,
            "key_points": key_points
        }

    def extract_entities(self, document_id: str) -> Dict:
        self._ensure_initialized()

        docs = self.vector_store.similarity_search(
            "important information dates amounts names numbers",
            k=5,
            filter={"document_id": document_id}
        )

        if len(docs) == 0:
            all_docs = self.vector_store.similarity_search("dates amounts names", k=30)
            docs = [doc for doc in all_docs if doc.metadata.get('document_id') == document_id][:5]

        if len(docs) == 0:
            from app.main import supabase
            db_chunks = supabase.table('document_chunks').select('*').eq('document_id', document_id).limit(5).execute()
            if len(db_chunks.data) == 0:
                return {"entities": {"dates": [], "amounts": [], "names": [], "other": []}}
            text = "\n\n".join([chunk['content'] for chunk in db_chunks.data])
        else:
            text = "\n\n".join([doc.page_content for doc in docs])

        if len(text) > 20000:
            text = text[:20000] + "..."

        prompt = f"""Extract the following information from this document:
- Dates (any important dates mentioned)
- Amounts (monetary values, quantities)
- Names (people, organizations, locations)
- Other important entities

Document:
{text}

Return the information in this format:
DATES:
- [Date 1]
AMOUNTS:
- [Amount 1]
NAMES:
- [Name 1]
OTHER:
- [Entity 1]
"""

        try:
            response = self.llm.predict(prompt)
        except Exception:
            response = self.llm.invoke(prompt)
            if hasattr(response, 'content'):
                if isinstance(response.content, str):
                    response = response.content
                elif isinstance(response.content, list):
                    response = ''.join([
                        part.get('text', '') if isinstance(part, dict) else str(part)
                        for part in response.content
                    ])
                else:
                    response = str(response.content)
            else:
                response = str(response)

        if not isinstance(response, str):
            response = str(response)

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