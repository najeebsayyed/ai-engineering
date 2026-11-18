
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field


from app.pdf_loader import extract_pdf_text
from app.chunking import chunk_pages
from app.embeddings import embed_chunks
from app.vector_store import store_chunks
from app.embeddings import embed_query
from app.vector_store import search_similar_chunks
from app.rag import generate_answer


class SearchRequest(BaseModel):
    question: str = Field(min_length=1)
    document_id: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)

class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    document_id: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)


app = FastAPI(title="PDF Chatbot")

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


@app.get("/")
def home():
    return {"message": "PDF Chatbot API is running!"}


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
            filename=filename
)
    except Exception as exc:
        pdf_path.unlink(missing_ok=True)
        raise HTTPException(
            400,
            "Unable to read this PDF. It may be damaged or encrypted."
        ) from exc

    full_text = "\n\n".join(page["text"] for page in pages)

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

    # 1. Convert question into an embedding
    query_embedding = embed_query(request.question)

    # 2. Search for similar chunks
    results = search_similar_chunks(
        query_embedding=query_embedding,
        n_results=request.top_k,
        document_id=request.document_id
    )

    # 3. Return retrieved information
    return {
        "question": request.question,
        "total_results": len(results),
        "results": results
    }


@app.post("/chat")
def chat(request: ChatRequest):

    if not request.question.strip():
        raise HTTPException(400, "Question cannot be empty.")

    # 1. Convert question into an embedding
    query_embedding = embed_query(request.question)

    # 2. Retrieve relevant PDF chunks
    retrieved_chunks = search_similar_chunks(
        query_embedding=query_embedding,
        n_results=request.top_k,
        document_id=request.document_id
    )

    # 3. Generate answer using retrieved context
    result = generate_answer(
        question=request.question,
        retrieved_chunks=retrieved_chunks
    )

    # 4. Return answer and source information
    return {
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"],
        "retrieved_chunks": len(retrieved_chunks)
    }
