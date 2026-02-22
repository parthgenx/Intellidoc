<div align="center">

# 🧠 IntelliDoc
### AI-Powered Document Intelligence Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-000000?style=for-the-badge)](https://www.pinecone.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**Upload your PDFs and have an intelligent conversation with them — powered by RAG and Google Gemini AI.**

[📖 API Docs](http://localhost:8000/docs) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

</div>

---

## 📸 Screenshots

> *Coming soon — deploy and add screenshots here!*

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 📤 **Document Upload** | Drag & drop PDF upload with real-time progress bar |
| 🤖 **AI Chat** | Ask questions and get context-aware AI answers |
| 🔍 **RAG Pipeline** | Retrieval-Augmented Generation using Pinecone vector search |
| 🔐 **Authentication** | Secure user accounts via Supabase Auth |
| 👤 **Per-user Storage** | Each user only sees their own documents |
| 🔒 **Row Level Security** | RLS policies enforced at the database level |
| 🎨 **Modern UI** | Glass morphism design with smooth animations |
| 🔔 **Live Feedback** | Toast notifications and skeleton loading states |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)           │
│   FileUpload · DocumentList · ChatInterface · Auth │
└──────────────────────┬────────────────────────────┘
                       │ REST API (Axios)
┌──────────────────────▼────────────────────────────┐
│              Backend (FastAPI / Python 3.12)        │
│   /api/upload · /api/chat · /api/documents         │
│                                                    │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ RAG Service │ │ Doc Processor│ │ Supabase    │ │
│  │ (LangChain) │ │ (PyMuPDF)    │ │ Admin Client│ │
│  └──────┬──────┘ └──────┬───────┘ └──────┬──────┘ │
└─────────┼───────────────┼────────────────┼─────────┘
          │               │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │   Pinecone  │ │  Supabase   │ │   Google    │
   │  Vector DB  │ │  Storage/DB │ │  Gemini AI  │
   └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance REST API |
| **Supabase** | PostgreSQL database, file storage & auth |
| **Pinecone** | Vector database for semantic search |
| **Google Gemini 2.0 Flash** | LLM for AI responses & embeddings |
| **LangChain** | RAG orchestration |
| **PyMuPDF** | PDF text extraction |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI library |
| **Vite** | Lightning-fast build tool |
| **TailwindCSS** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Supabase JS** | Auth & session management |
| **react-hot-toast** | Notification system |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- [Supabase](https://supabase.com) account (free)
- [Pinecone](https://pinecone.io) account (free)
- [Google AI Studio](https://aistudio.google.com) API key (free)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/intellidoc.git
cd intellidoc
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Fill in your API keys in .env

# Start the server
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your Supabase credentials in .env

# Start the dev server
npm run dev
```

### 4. Open the App

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |

---

## 🔑 Environment Variables

### `backend/.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

### `frontend/.env`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Never commit `.env` files. Use the `.env.example` templates provided.

---

## 📁 Project Structure

```
intellidoc/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app & all API routes
│   │   ├── rag_service.py          # RAG pipeline (embed → retrieve → generate)
│   │   ├── document_processor.py  # PDF parsing & text chunking
│   │   └── models.py               # Pydantic request/response models
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx      # Drag & drop upload with progress
│   │   │   ├── DocumentList.jsx   # User document library with search
│   │   │   ├── ChatInterface.jsx  # AI chat with markdown rendering
│   │   │   ├── DocumentViewer.jsx # PDF viewer panel
│   │   │   └── LoadingSpinner.jsx # Reusable loading component
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Signup.jsx          # Registration page
│   │   │   └── Dashboard.jsx       # Main app dashboard
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx     # Global authentication state
│   │   └── services/
│   │       ├── api.js              # Axios HTTP client
│   │       └── supabase.js         # Supabase client instance
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔄 How It Works

### Upload Flow
```
User drops PDF
  → Frontend sends file + user_id to /api/upload
  → PyMuPDF extracts text
  → Text split into overlapping chunks
  → Gemini generates embeddings for each chunk
  → Chunks + embeddings stored in Pinecone
  → Document metadata stored in Supabase
  → User sees success notification ✅
```

### Chat Flow
```
User types question
  → Frontend sends question + document_id to /api/chat
  → Gemini embeds the question
  → Pinecone returns top-K similar chunks
  → Chunks + question sent to Gemini as context
  → Gemini generates a grounded answer
  → Response rendered with Markdown ✅
```

---

## 🔐 Security

- **Supabase RLS** – users can only read/write their own rows
- **JWT sessions** – managed by Supabase Auth
- **Service Role separation** – admin key stays on server only; frontend uses anon key
- **No secrets in code** – all credentials via environment variables

---

## 📝 License

Distributed under the MIT License.

---

## 👨‍💻 Author

**Parth Bhat**
- GitHub: [@parthbhat](https://github.com/parthbhat)
- LinkedIn: [linkedin.com/in/parth-bhat](https://linkedin.com/in/parth-bhat)

---

<div align="center">
Built with ❤️ using React, FastAPI, and Google Gemini AI
</div>
