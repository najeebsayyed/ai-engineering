# DocuRAG: Production-Ready PDF Chatbot & Intelligence

A modern, production-ready Retrieval-Augmented Generation (RAG) system for querying PDF documents. The application pairs a high-performance **FastAPI** backend (leveraging **PyMuPDF**, **ChromaDB**, and **OpenAI APIs**) with a responsive, SaaS-style **React + TypeScript + Vite + Tailwind CSS** frontend inspired by NotebookLM and ChatGPT.

---

## Architecture & RAG Pipeline

```
┌───────────────────────┐
│     User Browser      │
│  React + TS + Vite    │
└───────────┬───────────┘
            │ HTTP / JSON
            ▼
┌───────────────────────────────────────────────────────────────┐
│                    FastAPI Backend Server                     │
│                                                               │
│  ┌───────────────┐    ┌────────────────┐   ┌───────────────┐  │
│  │ PyMuPDF (PDF) │───▶│ Sliding-Window │──▶│ OpenAI Embed  │  │
│  │   Extractor   │    │ Text Chunking  │   │  (3-small)    │  │
│  └───────────────┘    └────────────────┘   └───────┬───────┘  │
│                                                    │          │
│  ┌────────────────┐    ┌───────────────┐           ▼          │
│  │  OpenAI LLM    │◀───│ Similarity    │◀───┌──────────────┐  │
│  │ (Answer + Cite)│    │ Search (HNSW) │    │  ChromaDB    │  │
│  └───────────────┘    └───────────────┘    │  Vector DB   │  │
│                                             └──────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

1. **Extraction**: Uploaded PDFs are parsed page-by-page using PyMuPDF (`pymupdf`).
2. **Chunking**: Text is split into contextual chunks using sliding windows (default `chunk_size=1000` chars, `overlap=150` chars) preserving page numbers and chunk offsets.
3. **Embeddings**: Chunks are embedded in batches via OpenAI's `text-embedding-3-small` (1536 dimensions).
4. **Vector Storage**: Stored locally in persistent ChromaDB collections (`pdf_chunks`) configured with cosine distance.
5. **Retrieval**: User queries are embedded into vector space and matched against nearest chunks with optional document-level filtering (`document_id`).
6. **Augmented Generation**: The LLM synthesizes concise answers grounded strictly in retrieved context and attributes supporting statements to `[Source X]` citations with exact page numbers.

---

## Key Features

### 1. Document Management & Upload
- **Drag-and-Drop Upload**: Clean dropzone supporting PDF files up to 20 MB with client and server-side validation.
- **Multi-Stage Processing Feedback**: Step-by-step pipeline indicators (`Uploading` ➔ `Extracting & Chunking` ➔ `Embedding & Vectorizing`).
- **Inspection Preview**: View extracted text length, chunk counts, vector dimensions, and sample chunk previews.
- **Document Library**: Browse indexed documents with metadata (pages, chunks, size, date).
- **Embedded PDF Viewer**: Modal to inspect original PDF pages alongside citations.
- **Cascading Deletion**: Deleting a document removes its physical PDF file, registry metadata, and all associated vectors in ChromaDB without affecting other files.

### 2. Conversational AI & Grounded Q&A
- **Strict Document Grounding**: Prevents hallucinations by confining responses to retrieved context chunks.
- **Source Citations**: Displays clickable citation tags (`[Source 1]`, `[Source 2]`) with original filename, page number, and quote excerpt.
- **Document-Scoped or Global Search**: Chat with an individual active document or query across the entire vector library.
- **Tunable Retrieval (`top_k`)**: Dynamically adjust how many chunks (3, 5, 8, 10) feed into the LLM context.
- **Empty State Suggestions**: Document-specific prompt recommendations for instant exploration.
- **Robust Error Handling**: Retry failed queries, copy answers to clipboard, auto-scrolling message stream, and health monitoring.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v3, Lucide React Icons |
| **Backend** | Python 3.13+, FastAPI, Uvicorn, PyMuPDF, Pydantic, Python-Dotenv |
| **Vector DB** | ChromaDB (Local persistent SQLite + HNSW index) |
| **AI / Embeddings** | OpenAI API (`text-embedding-3-small`, `gpt-4o-mini` / `CHAT_MODEL`) |
| **Testing** | Python `unittest` + `TestClient` (Backend), `Vitest` (Frontend) |

---

## Project Structure

```
pdf-chatbot/
├── app/                        # FastAPI Backend Application
│   ├── chunking.py             # Sliding-window page chunking
│   ├── documents.py            # Document registry & metadata management
│   ├── embeddings.py           # OpenAI embedding batching & query embedding
│   ├── main.py                 # FastAPI routes (upload, search, chat, docs, health)
│   ├── pdf_loader.py           # PyMuPDF text extraction
│   ├── rag.py                  # Context assembly, prompt constraints & OpenAI LLM call
│   └── vector_store.py         # Persistent ChromaDB client & similarity search
├── frontend/                   # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/           # ChatInterface, MessageBubble, ChatInput, SourceCitation
│   │   │   ├── common/         # ErrorBoundary, Toast notifications
│   │   │   ├── dashboard/      # DashboardOverview, QuickStartGuide
│   │   │   ├── documents/      # DocumentList, DocumentCard, PdfViewerModal, DeleteConfirmModal
│   │   │   ├── layout/         # Navbar, Sidebar, MainLayout
│   │   │   └── upload/         # FileDropzone, UploadProgress, UploadSection
│   │   ├── services/
│   │   │   ├── api.ts          # Centralized API service with timeout handling
│   │   │   └── api.test.ts     # Vitest unit tests for API client
│   │   ├── types/
│   │   │   └── index.ts        # TypeScript data types & schemas
│   │   ├── App.tsx             # Root application orchestrator
│   │   └── index.css           # Tailwind CSS directives
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── tests/
│   └── test_backend.py         # Integration & unit tests for FastAPI backend
├── uploads/                    # Local storage for uploaded PDF files (gitignored)
├── vector_db/                  # ChromaDB vector index directory (gitignored)
├── .env.example                # Backend environment variable template
├── pyproject.toml              # Python project configuration & dependencies
└── README.md                   # Project documentation
```

---

## Getting Started

### Prerequisites
- **Python 3.13+**
- **Node.js 18+** and **npm**
- **OpenAI API Key**

---

### Backend Setup

1. **Navigate to the project root:**
   ```powershell
   cd c:\ai-engineering\4_RAG\pdf-chatbot
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   OPENAI_API_KEY=sk-...your-key...
   CHAT_MODEL=gpt-4o-mini
   EMBEDDING_MODEL=text-embedding-3-small
   ```

3. **Activate Python Virtual Environment & install dependencies:**
   ```powershell
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   ```

4. **Start the FastAPI backend server:**
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
   The API will be live at `http://localhost:8000`.
   - Interactive Swagger API docs: `http://localhost:8000/docs`
   - Alternative ReDoc: `http://localhost:8000/redoc`

---

### Frontend Setup

1. **Open a new terminal and navigate to `frontend/`:**
   ```powershell
   cd c:\ai-engineering\4_RAG\pdf-chatbot\frontend
   ```

2. **Install frontend dependencies:**
   ```powershell
   npm install
   ```

3. **Verify or set `.env`:**
   Ensure `frontend/.env` points to the backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Start the Vite development server:**
   ```powershell
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## Running Tests

### Backend Tests
Run the integration and unit tests using Python's built-in test runner:
```powershell
cd c:\ai-engineering\4_RAG\pdf-chatbot
.\.venv\Scripts\python.exe -m unittest tests/test_backend.py
```

### Frontend Tests
Run Vitest unit tests in the frontend directory:
```powershell
cd c:\ai-engineering\4_RAG\pdf-chatbot\frontend
npm run test
```

### Production Build Verification
Test the frontend production bundle:
```powershell
cd c:\ai-engineering\4_RAG\pdf-chatbot\frontend
npm run build
```

---

## API Endpoints Reference

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/` | API status message | None |
| `GET` | `/health` | Health check & vector metrics | None |
| `GET` | `/documents` | List all indexed documents | None |
| `DELETE` | `/documents/{id}` | Delete document and vector records | None |
| `GET` | `/documents/{id}/pdf` | Stream raw PDF for preview | None |
| `POST` | `/upload` | Upload & vectorize PDF | `multipart/form-data` (`file`) |
| `POST` | `/search` | Retrieve similar chunks without LLM | `{ "question": str, "top_k": int, "document_id": str }` |
| `POST` | `/chat` | RAG answer with source citations | `{ "question": str, "top_k": int, "document_id": str }` |

---

## Limitations & Considerations

- **Scanned PDFs**: Non-OCR scanned PDFs containing only raw images will extract zero text. Integrating an OCR fallback (such as Tesseract) would expand coverage.
- **Authentication**: Single-tenant setup suitable for internal or personal workloads; multi-user tenant isolation is not enabled by default.
- **Streaming Responses**: Responses are returned after complete synthesis. Adding Server-Sent Events (SSE) or WebSocket streaming would provide real-time token streaming.
