
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile

from app.pdf_loader import extract_pdf_text

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

    pdf_path = UPLOAD_DIR / f"{uuid4().hex}.pdf"
    pdf_path.write_bytes(content)

    try:
        pages = extract_pdf_text(pdf_path)
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
        )
    }
