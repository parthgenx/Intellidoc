from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from supabase import create_client
from app.rag_service import rag_service
import os
import tempfile
import uuid
from dotenv import load_dotenv
from app.document_processor import document_processor
from app.models import ChatRequest

load_dotenv()

app = FastAPI(title="IntelliDoc API", version="1.0.0")

supabase_url = os.getenv("SUPABASE_URL")
if not supabase_url.endswith('/'):
    supabase_url += '/'

supabase = create_client(supabase_url, os.getenv("SUPABASE_KEY"))
supabase_admin = create_client(supabase_url, os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

allowed_origins = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in allowed_origins if o],
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


@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok"}


def _update_document_status(document_id: str, status: str):
    supabase_admin.table('documents').update({
        "status": status
    }).eq('id', document_id).execute()


def _store_document_chunks(document_id: str, chunks, batch_size: int = 100):
    rows = [
        {
            "document_id": document_id,
            "content": chunk['text'],
            "chunk_index": chunk['chunk_id']
        }
        for chunk in chunks
    ]

    for start in range(0, len(rows), batch_size):
        supabase_admin.table('document_chunks').insert(rows[start:start + batch_size]).execute()


def _process_uploaded_document(document_id: str, temp_file_path: str):
    try:
        extracted_text = document_processor.extract_text_from_pdf(temp_file_path)
        chunks = document_processor.chunk_text(extracted_text)

        if not chunks:
            raise ValueError("No extractable text was found in this PDF.")

        _store_document_chunks(document_id, chunks)
        rag_service.add_document_to_vector_store(chunks, document_id)
        _update_document_status(document_id, "ready")
    except Exception:
        import traceback
        traceback.print_exc()
        _update_document_status(document_id, "failed")
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.post("/api/chat")
async def chat_with_document(request: ChatRequest):
    try:
        result = rag_service.query_documents(
            question=request.question,
            document_id=request.document_id
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    temp_file_path = None
    try:
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{file_id}.{file_extension}"

        content = await file.read()

        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name

        supabase_admin.storage.from_('documents').upload(
            unique_filename,
            content,
            {"content-type": file.content_type}
        )

        file_url = supabase_admin.storage.from_('documents').get_public_url(unique_filename)

        db_response = supabase_admin.table('documents').insert({
            "filename": file.filename,
            "file_url": file_url,
            "file_size": len(content),
            "status": "processing",
            "user_id": user_id
        }).execute()

        document_id = db_response.data[0]['id']
        background_tasks.add_task(_process_uploaded_document, document_id, temp_file_path)
        temp_file_path = None

        return {
            "message": "File uploaded successfully. Processing has started.",
            "document_id": document_id,
            "filename": file.filename,
            "status": "processing"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)


@app.get("/api/documents")
async def get_documents(user_id: str = None):
    try:
        if user_id:
            response = supabase_admin.table('documents').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        else:
            response = supabase_admin.table('documents').select('*').order('created_at', desc=True).execute()
        return {"documents": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    try:
        supabase_admin.table('documents').delete().eq('id', document_id).execute()
        return {"message": "Document deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents/{document_id}/chunks")
async def get_document_chunks(document_id: str):
    try:
        response = supabase.table('document_chunks').select('*').eq('document_id', document_id).order('chunk_index').execute()
        return {"chunks": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/documents/{document_id}/summarize")
async def summarize_document(document_id: str):
    try:
        result = rag_service.summarize_document(document_id)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/documents/{document_id}/extract")
async def extract_entities(document_id: str):
    try:
        result = rag_service.extract_entities(document_id)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
