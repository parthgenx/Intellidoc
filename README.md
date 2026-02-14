# IntelliDoc - AI-Powered Document Intelligence Platform

IntelliDoc is an industry-grade AI platform that enables intelligent document processing, analysis, and interaction using advanced AI technologies.

## 🚀 Features

- **Multi-format Document Upload**: Support for PDF, DOCX, TXT, and more
- **AI-Powered Chat**: Interactive conversations with your documents using Google Gemini 2.0 Flash
- **RAG (Retrieval Augmented Generation)**: Context-aware responses using Pinecone vector database
- **Smart Extraction**: Document summarization and entity recognition
- **Persistent Storage**: Secure document storage with Supabase
- **Modern UI**: Beautiful, responsive React interface with TailwindCSS

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Supabase** - Database and authentication
- **Pinecone** - Vector database for embeddings
- **Google Gemini AI** - Advanced language model
- **Google Embeddings** - Document vectorization

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Markdown** - Markdown rendering

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- Git

## 🚀 Quick Start

### Clone the Repository
\`\`\`bash
git clone <your-repo-url>
cd IntelliDoc
\`\`\`

### Backend Setup
\`\`\`bash
cd backend
python -m venv venv

# Windows
venv\\Scripts\\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Copy .env.example to .env and fill in your API keys
cp .env.example .env

# Start the backend
uvicorn app.main:app --reload
\`\`\`

### Frontend Setup
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory with:

\`\`\`env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
\`\`\`

## 📖 Migration Guide

If you're setting up this project on a new machine (especially macOS), see the detailed [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for step-by-step instructions.

## 🏗️ Project Structure

\`\`\`
IntelliDoc/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Data models
│   │   ├── services.py          # Business logic
│   │   ├── rag_service.py       # RAG implementation
│   │   └── document_processor.py # Document processing
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   └── App.jsx              # Main app component
│   ├── package.json
│   └── vite.config.js
└── README.md
\`\`\`

## 📝 License

This project is for portfolio purposes.

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome!
