from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from dotenv import load_dotenv
import os
from typing import List, Dict
# Load environment variables
load_dotenv()
class RAGService:
    """RAG service for document Q&A"""
    
    def __init__(self):
        self._initialized = False
        self.index = None
        self.embeddings = None
        self.vector_store = None
        self.llm = None
    
    def _ensure_initialized(self):
        """Initialize RAG components only when needed"""
        if self._initialized:
            return
        
        print("🔧 Initializing RAG Service...")
        
        # Check API keys
        pinecone_key = os.getenv("PINECONE_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY")
        
        if not pinecone_key:
            raise Exception("PINECONE_API_KEY not found in environment variables!")
        if not gemini_key:
            raise Exception("GEMINI_API_KEY not found in environment variables!")
        
        # Initialize Pinecone
        pc = Pinecone(api_key=pinecone_key)
        self.index = pc.Index("intellidoc")
        
        # Initialize embeddings with 768 dimensions to match Pinecone index
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=768,
            google_api_key=gemini_key
        )
        
        # Initialize vector store
        self.vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings
        )
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3-flash-preview",
            google_api_key=gemini_key,
            temperature=0.3
        )
        
        self._initialized = True
        print("✅ RAG Service initialized!")
    
    def add_document_to_vector_store(self, chunks: List[Dict], document_id: str):
        """Add document chunks to Pinecone"""
        self._ensure_initialized()
        
        print(f"📤 Adding {len(chunks)} chunks to vector store...")
        
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
        
        # Add to vector store
        self.vector_store.add_texts(
            texts=texts,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"✅ Added {len(chunks)} chunks to Pinecone!")
    
    def query_documents(self, question: str, document_id: str = None, top_k: int = 3) -> Dict:
        """Query documents using RAG"""
        self._ensure_initialized()
        
        print(f"🔍 Searching for: {question}")
        
        # Build filter
        filter_dict = {"document_id": document_id} if document_id else None
        
        # Search vector store
        docs = self.vector_store.similarity_search(
            question,
            k=top_k,
            filter=filter_dict
        )
        
        print(f"📚 Found {len(docs)} relevant chunks")
        
        if len(docs) == 0:
            return {
                "answer": "I couldn't find any relevant information in this document to answer your question.",
                "sources": []
            }
        
        # Build context
        context = "\n\n".join([doc.page_content for doc in docs])
        
        # Create prompt
        prompt = f"""You are a helpful AI assistant. Answer the question based on the following context.
        
Context:
{context}
Question: {question}
Answer: Provide a clear, concise answer based on the context. If the answer is not in the context, say "I don't have enough information to answer that."
"""
        
        # Get AI response
        print("🤖 Generating AI response...")
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
            if text_match:
                answer_text = text_match.group(1)
            else:
                answer_text = response_str
                
        answer_text = answer_text.replace('\\n', '\n').replace('\\"', '"')
        
        print(f"✅ Generated answer: {answer_text[:100]}...")
        
        # Extract sources
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
        """Generate a summary of the entire document"""
        self._ensure_initialized()
        
        print(f"📝 Summarizing document: {document_id}")
        
        # Try multiple search strategies
        docs = []
        
        # Strategy 1: Generic summary query
        docs = self.vector_store.similarity_search(
            "summary overview main points key information",
            k=10,
            filter={"document_id": document_id}
        )
        
        # Strategy 2: If no results, try without filter
        if len(docs) == 0:
            print("⚠️ No chunks found with filter, trying without filter...")
            all_docs = self.vector_store.similarity_search(
                "summary overview",
                k=50
            )
            docs = [doc for doc in all_docs if doc.metadata.get('document_id') == document_id][:10]
        
        # Strategy 3: Get from database
        if len(docs) == 0:
            print("⚠️ No chunks in vector store, fetching from database...")
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
        
        print(f"📊 Using {len(full_text)} characters for summarization")
        
        # Limit text length
        if len(full_text) > 30000:
            full_text = full_text[:30000] + "..."
            print("⚠️ Text truncated to 30k characters")
        
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
        
        print("🤖 Generating summary...")
        try:
            response = self.llm.predict(prompt)
        except Exception as e:
            print(f"Predict failed: {e}, trying invoke...")
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
        
        print(f"📄 Response type: {type(response)}")
        print(f"📄 Response preview: {response[:200]}...")
        
        parts = response.split("KEY POINTS:")
        summary = parts[0].replace("SUMMARY:", "").strip()
        key_points_text = parts[1].strip() if len(parts) > 1 else ""
        
        key_points = [
            line.strip().lstrip('-').lstrip('*').strip()
            for line in key_points_text.split('\n')
            if line.strip() and (line.strip().startswith('-') or line.strip().startswith('*'))
        ]
        
        print(f"✅ Summary generated with {len(key_points)} key points")
        
        return {
            "summary": summary,
            "key_points": key_points
        }
    def extract_entities(self, document_id: str) -> Dict:
        """Extract key entities from document"""
        self._ensure_initialized()
        
        print(f"🔍 Extracting entities from document: {document_id}")
        
        # Try multiple search strategies
        docs = self.vector_store.similarity_search(
            "important information dates amounts names numbers",
            k=5,
            filter={"document_id": document_id}
        )
        
        # Fallback: try without filter
        if len(docs) == 0:
            print("⚠️ No chunks found with filter, trying without filter...")
            all_docs = self.vector_store.similarity_search(
                "dates amounts names",
                k=30
            )
            docs = [doc for doc in all_docs if doc.metadata.get('document_id') == document_id][:5]
        
        # Fallback: get from database
        if len(docs) == 0:
            print("⚠️ No chunks in vector store, fetching from database...")
            from app.main import supabase
            db_chunks = supabase.table('document_chunks').select('*').eq('document_id', document_id).limit(5).execute()
            
            if len(db_chunks.data) == 0:
                return {
                    "entities": {
                        "dates": [],
                        "amounts": [],
                        "names": [],
                        "other": []
                    }
                }
            
            text = "\n\n".join([chunk['content'] for chunk in db_chunks.data])
        else:
            text = "\n\n".join([doc.page_content for doc in docs])
        
        print(f"📊 Using {len(text)} characters for extraction")
        
        # Limit text length
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
- [Date 2]
AMOUNTS:
- [Amount 1]
- [Amount 2]
NAMES:
- [Name 1]
- [Name 2]
OTHER:
- [Entity 1]
- [Entity 2]
"""
        
        print("🤖 Extracting entities...")
        try:
            response = self.llm.predict(prompt)
        except Exception as e:
            print(f"Predict failed: {e}, trying invoke...")
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
        
        entities = {
            "dates": [],
            "amounts": [],
            "names": [],
            "other": []
        }
        
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
        
        print(f"✅ Extracted entities: {sum(len(v) for v in entities.values())} total")
        
        return {"entities": entities}
rag_service = RAGService()