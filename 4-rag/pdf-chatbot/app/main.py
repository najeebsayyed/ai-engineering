from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.chunking import chunk_pages
from app.documents import (
    get_document,
    list_documents,
    remove_document,
    save_document,
)
from app.embeddings import embed_chunks, embed_query
from app.pdf_loader import extract_pdf_text
from app.rag import generate_answer
from app.vector_store import (
    collection,
    delete_document_chunks,
    search_similar_chunks,
    store_chunks,
)


class SearchRequest(BaseModel):
    question: str = Field(min_length=1)
    document_id: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    document_id: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)


app = FastAPI(title="PDF Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@app.get("/")
def home():
    return {"message": "PDF Chatbot API is running!"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "total_documents": len(list_documents()),
        "total_vectors": collection.count(),
    }


@app.get("/documents")
def get_documents_endpoint():
    return {"documents": list_documents()}


@app.delete("/documents/{document_id}")
def delete_document_endpoint(document_id: str):
    pdf_path = UPLOAD_DIR / f"{document_id}.pdf"
    pdf_path.unlink(missing_ok=True)
    delete_document_chunks(document_id)
    removed = remove_document(document_id)
    return {
        "status": "success",
        "message": f"Document {document_id} and its associated vectors deleted.",
        "document_id": document_id,
        "removed": removed,
    }


@app.get("/documents/{document_id}/pdf")
def get_document_pdf(document_id: str):
    doc = get_document(document_id)
    filename = doc.get("filename", f"{document_id}.pdf") if doc else f"{document_id}.pdf"
    pdf_path = UPLOAD_DIR / f"{document_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(404, "PDF file not found.")
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename,
    )


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    filename = file.filename or ""

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed.")

    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(413, "PDF must be smaller than 20 MB.")

    if not content.startswith(b"%PDF-"):
        raise HTTPException(400, "Invalid PDF file.")

    document_id = uuid4().hex
    pdf_path = UPLOAD_DIR / f"{document_id}.pdf"
    pdf_path.write_bytes(content)

    try:
        pages = extract_pdf_text(pdf_path)
        chunks = chunk_pages(pages)
        embedded_chunks = embed_chunks(chunks)
        stored_count = store_chunks(
            embedded_chunks,
            document_id=document_id,
            filename=filename,
        )
    except Exception as exc:
        pdf_path.unlink(missing_ok=True)
        raise HTTPException(
            400,
            "Unable to read this PDF. It may be damaged or encrypted.",
        ) from exc

    full_text = "\n\n".join(page["text"] for page in pages)

    # Persist document metadata
    doc_meta = {
        "document_id": document_id,
        "filename": filename,
        "total_pages": len(pages),
        "pages_with_text": sum(bool(p["text"]) for p in pages),
        "total_characters": len(full_text),
        "total_chunks": len(chunks),
        "file_size": len(content),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "status": "ready",
        "preview": full_text[:1000],
    }
    save_document(doc_meta)

    return {
        "filename": filename,
        "total_pages": len(pages),
        "pages_with_text": sum(bool(p["text"]) for p in pages),
        "total_characters": len(full_text),
        "preview": full_text[:1000],
        "message": (
            "Text extracted successfully."
            if full_text.strip()
            else "No selectable text found. This may be a scanned PDF."
        ),
        "total_chunks": len(chunks),
        "chunk_previews": [
            {
                "chunk_id": chunk["chunk_id"],
                "page_number": chunk["page_number"],
                "text": chunk["text"][:200],
            }
            for chunk in chunks[:10]
        ],
        "total_embeddings": len(embedded_chunks),
        "embedding_dimensions": (
            len(embedded_chunks[0]["embedding"])
            if embedded_chunks else 0
        ),
        "embedding_preview": (
            embedded_chunks[0]["embedding"][:5]
            if embedded_chunks else []
        ),
        "document_id": document_id,
        "vector_records_stored": stored_count,
    }


@app.post("/search")
def search_pdf(request: SearchRequest):
    if not request.question.strip():
        raise HTTPException(400, "Question cannot be empty.")

    query_embedding = embed_query(request.question)
    results = search_similar_chunks(
        query_embedding=query_embedding,
        n_results=request.top_k,
        document_id=request.document_id,
    )

    return {
        "question": request.question,
        "total_results": len(results),
        "results": results,
    }


@app.post("/chat")
def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(400, "Question cannot be empty.")

    query_embedding = embed_query(request.question)
    retrieved_chunks = search_similar_chunks(
        query_embedding=query_embedding,
        n_results=request.top_k,
        document_id=request.document_id,
    )

    result = generate_answer(
        question=request.question,
        retrieved_chunks=retrieved_chunks,
    )

    return {
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"],
        "retrieved_chunks": len(retrieved_chunks),
    }
