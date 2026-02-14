from pydantic import BaseModel
from typing import Optional, List
class Document(BaseModel):
    """Model for uploaded documents"""
    id: Optional[str] = None
    filename: str
    file_url: Optional[str] = None
    status: str = "processing"
    created_at: Optional[str] = None
class ChatMessage(BaseModel):
    """Model for chat messages"""
    message: str
    document_id: str
    conversation_id: Optional[str] = None
class ChatResponse(BaseModel):
    """Model for AI responses"""
    answer: str
    sources: Optional[List[dict]] = []
    timestamp: str
class SignupRequest(BaseModel):
    email: str
    password: str
class LoginRequest(BaseModel):
    email: str
    password: str
class ChatRequest(BaseModel):
    """Model for chat requests"""
    question: str
    document_id: str