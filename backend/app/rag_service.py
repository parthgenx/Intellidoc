from pinecone import Pinecone
from dotenv import load_dotenv
import os
from typing import List, Dict
from langchain_anthropic import ChatAnthropic
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore

load_dotenv()


class RAGService:
    def __init__(self):
        self._initialized = False
        self.index = None
        self.vector_store = None
        self.embeddings = None
        self.chat_model = None
        self.answer_chain = None
        self.summary_chain = None
        self.entity_chain = None

    def _ensure_initialized(self):
        if self._initialized:
            return

        pinecone_key = os.getenv("PINECONE_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        if not pinecone_key:
            raise Exception("PINECONE_API_KEY not found in environment variables!")
        if not anthropic_key:
            raise Exception("ANTHROPIC_API_KEY not found in environment variables!")

        index_name = os.getenv("PINECONE_INDEX_NAME", "intellidoc-langchain")
        embedding_model = os.getenv("PINECONE_EMBEDDING_MODEL", "llama-text-embed-v2")
        embedding_dimension = int(os.getenv("PINECONE_EMBEDDING_DIMENSION", "768"))
        anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-0")

        self.embeddings = PineconeEmbeddings(
            model=embedding_model,
            dimension=embedding_dimension,
            pinecone_api_key=pinecone_key,
            query_params={
                "input_type": "query",
                "dimension": embedding_dimension,
            },
            document_params={
                "input_type": "passage",
                "dimension": embedding_dimension,
            },
        )
        self.chat_model = ChatAnthropic(
            model_name=anthropic_model,
            api_key=anthropic_key,
            temperature=0,
            max_tokens_to_sample=1024,
        )

        pc = Pinecone(api_key=pinecone_key)
        self.index = pc.Index(index_name)
        self.vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings,
            text_key="text",
        )
        self.answer_chain = self._build_answer_chain()
        self.summary_chain = self._build_summary_chain()
        self.entity_chain = self._build_entity_chain()

        self._initialized = True
        print("RAG Service initialized successfully")

    def _build_answer_chain(self):
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are a helpful AI assistant. Answer questions only from the provided context. "
                "If the context is insufficient, say you do not have enough information."
            ),
            (
                "human",
                "Context:\n{context}\n\nQuestion: {question}\n\n"
                "Provide a clear, concise answer grounded in the context."
            ),
        ])
        return prompt | self.chat_model | StrOutputParser()

    def _build_summary_chain(self):
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You analyze uploaded documents and return structured summaries."
            ),
            (
                "human",
                "Analyze the following document and provide:\n"
                "1. A concise summary (2-3 paragraphs)\n"
                "2. Key points (bullet list of 5-7 main takeaways)\n\n"
                "Document:\n{document_text}\n\n"
                "Return in this format:\n"
                "SUMMARY:\n"
                "[Your summary here]\n\n"
                "KEY POINTS:\n"
                "- [Point 1]\n"
                "- [Point 2]"
            ),
        ])
        return prompt | self.chat_model | StrOutputParser()

    def _build_entity_chain(self):
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You extract structured entities from business and general-purpose documents."
            ),
            (
                "human",
                "Extract the following information from this document:\n"
                "- Dates\n"
                "- Amounts\n"
                "- Names\n"
                "- Other important entities\n\n"
                "Document:\n{document_text}\n\n"
                "Return in this format:\n"
                "DATES:\n"
                "- [Date 1]\n"
                "AMOUNTS:\n"
                "- [Amount 1]\n"
                "NAMES:\n"
                "- [Name 1]\n"
                "OTHER:\n"
                "- [Entity 1]"
            ),
        ])
        return prompt | self.chat_model | StrOutputParser()

    def _search(self, query: str, document_id: str = None, top_k: int = 3) -> List[Document]:
        self._ensure_initialized()

        filter_dict = {"document_id": {"$eq": document_id}} if document_id else None
        return self.vector_store.similarity_search(
            query,
            k=top_k,
            filter=filter_dict,
        )

    def add_document_to_vector_store(self, chunks: List[Dict], document_id: str):
        self._ensure_initialized()

        documents = []
        vector_ids = []

        for chunk in chunks:
            documents.append(
                Document(
                    page_content=chunk['text'],
                    metadata={
                        "document_id": document_id,
                        "chunk_index": chunk['chunk_id'],
                    }
                )
            )
            vector_ids.append(f"{document_id}_{chunk['chunk_id']}")

        if documents:
            self.vector_store.add_documents(documents=documents, ids=vector_ids)

    def _generate_answer(self, context: str, question: str) -> str:
        return self.answer_chain.invoke({
            "context": context,
            "question": question,
        }).strip()

    def _generate_summary(self, document_text: str) -> str:
        return self.summary_chain.invoke({
            "document_text": document_text,
        }).strip()

    def _generate_entities(self, document_text: str) -> str:
        return self.entity_chain.invoke({
            "document_text": document_text,
        }).strip()

    def query_documents(self, question: str, document_id: str = None, top_k: int = 3) -> Dict:
        self._ensure_initialized()

        matches = self._search(question, document_id, top_k)

        if not matches:
            return {
                "answer": "I couldn't find any relevant information in this document to answer your question.",
                "sources": []
            }

        context = "\n\n".join([match.page_content for match in matches])
        answer_text = self._generate_answer(context, question)

        sources = [
            {
                "text": match.page_content[:200] + "...",
                "metadata": {
                    "document_id": match.metadata.get("document_id"),
                    "chunk_index": match.metadata.get("chunk_index")
                }
            }
            for match in matches
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
            full_text = "\n\n".join([match.page_content for match in matches])

        if len(full_text) > 30000:
            full_text = full_text[:30000] + "..."

        response = self._generate_summary(full_text)

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
            text = "\n\n".join([match.page_content for match in matches])

        if len(text) > 20000:
            text = text[:20000] + "..."

        response = self._generate_entities(text)

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
