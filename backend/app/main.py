from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from supabase import create_client
from app.rag_service import rag_service
import os
import uuid
from dotenv import load_dotenv
from app.document_processor import document_processor
import tempfile
import shutil
from app.models import ChatRequest

load_dotenv()

app = FastAPI(title="IntelliDoc API", version="1.0.0")
supabase_url = os.getenv("SUPABASE_URL")

if not supabase_url.endswith('/'):
    supabase_url += '/'

# Client for database operations (anon key)
supabase = create_client(
    supabase_url,
    os.getenv("SUPABASE_KEY")
)

# Client for storage operations (service role key to bypass RLS)
supabase_admin = create_client(
    supabase_url,
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "IntelliDoc API is running!",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/chat")
async def chat_with_document(request: ChatRequest):
    """Chat with a document using RAG"""
    try:
        result = rag_service.query_documents(
            question=request.question,
            document_id=request.document_id
        )
        return result
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a PDF document"""
    temp_file_path = None
    
    try:
        print(f"📤 Uploading file: {file.filename}")
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{file_id}.{file_extension}"
        
        # Read file content
        content = await file.read()
        print(f"📊 File size: {len(content)} bytes")
        
        # Save temporarily for processing
        temp_file_path = f"temp_{unique_filename}"
        with open(temp_file_path, 'wb') as f:
            f.write(content)
        
        print(f"💾 Saved temp file: {temp_file_path}")
        
        # Upload to Supabase Storage
        storage_response = supabase.storage.from_('documents').upload(
            unique_filename,
            content,
            {"content-type": file.content_type}
        )
        
        # Get public URL
        file_url = supabase.storage.from_('documents').get_public_url(unique_filename)
        print(f"☁️ Uploaded to storage: {file_url}")
        
        # Extract text from PDF
        print("🔍 Extracting text from PDF...")
        extracted_text = document_processor.extract_text_from_pdf(temp_file_path)
        
        # Create chunks
        print("📦 Creating text chunks...")
        chunks = document_processor.chunk_text(extracted_text)
        
        # Save metadata to database
        db_response = supabase.table('documents').insert({
            "filename": file.filename,
            "file_url": file_url,
            "file_size": len(content),
            "status": "processing",
            "user_id": None
        }).execute()
        
        document_id = db_response.data[0]['id']
        print(f"📝 Document saved with ID: {document_id}")
        
        # Save chunks to database
        for chunk in chunks:
            supabase.table('document_chunks').insert({
                "document_id": document_id,
                "content": chunk['text'],
                "chunk_index": chunk['chunk_id']
            }).execute()
        
        # Add to vector store
        if len(chunks) > 0:
            print("🧠 Adding to vector store...")
            rag_service.add_document_to_vector_store(chunks, document_id)
        else:
            print("⚠️ No chunks to add to vector store")
        
        # Update status to ready
        supabase.table('documents').update({
            "status": "ready"
        }).eq('id', document_id).execute()
        
        print(f"✅ Document processed! {len(chunks)} chunks created")
        
        return {
            "message": "File uploaded and processed successfully!",
            "document_id": document_id,
            "filename": file.filename,
            "chunks_created": len(chunks)
        }
        
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            print(f"🗑️ Cleaned up temp file")
    
@app.get("/api/documents")
async def get_documents():
    """Get all documents"""
    try:
        response = supabase.table('documents').select('*').order('created_at', desc=True).execute()
        return {"documents": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    try:
        # Delete from database (cascades to chunks)
        supabase.table('documents').delete().eq('id', document_id).execute()
        return {"message": "Document deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents/{document_id}/chunks")
async def get_document_chunks(document_id: str):
    """Get all chunks for a document"""
    try:
        response = supabase.table('document_chunks').select('*').eq('document_id', document_id).order('chunk_index').execute()
        return {"chunks": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/{document_id}/summarize")
async def summarize_document(document_id: str):
    """Generate document summary"""
    try:
        result = rag_service.summarize_document(document_id)
        return result
    except Exception as e:
        print(f"Summarization error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/documents/{document_id}/extract")
async def extract_entities(document_id: str):
    """Extract entities from document"""
    try:
        result = rag_service.extract_entities(document_id)
        return result
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))            