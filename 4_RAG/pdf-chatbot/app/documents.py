import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.vector_store import collection

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_FILE = UPLOAD_DIR / "documents.json"


def _read_registry() -> dict[str, dict[str, Any]]:
    if not DOCUMENTS_FILE.exists():
        # Backfill existing documents if any exist in ChromaDB or uploads
        registry = _backfill_existing()
        _write_registry(registry)
        return registry

    try:
        data = json.loads(DOCUMENTS_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return data
        return {}
    except Exception:
        return {}


def _write_registry(registry: dict[str, dict[str, Any]]) -> None:
    DOCUMENTS_FILE.write_text(
        json.dumps(registry, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )


def _backfill_existing() -> dict[str, dict[str, Any]]:
    registry: dict[str, dict[str, Any]] = {}
    try:
        chroma_data = collection.get(include=["metadatas"])
        metadatas = chroma_data.get("metadatas") or []

        doc_summary: dict[str, dict[str, Any]] = {}
        for meta in metadatas:
            if not meta:
                continue
            doc_id = meta.get("document_id")
            if not doc_id:
                continue
            if doc_id not in doc_summary:
                doc_summary[doc_id] = {
                    "filename": meta.get("filename", f"{doc_id}.pdf"),
                    "max_page": meta.get("page_number", 1),
                    "chunk_count": 0,
                }
            doc_summary[doc_id]["chunk_count"] += 1
            if meta.get("page_number", 0) > doc_summary[doc_id]["max_page"]:
                doc_summary[doc_id]["max_page"] = meta.get("page_number", 1)

        for doc_id, summary in doc_summary.items():
            pdf_path = UPLOAD_DIR / f"{doc_id}.pdf"
            file_size = pdf_path.stat().st_size if pdf_path.exists() else 0
            registry[doc_id] = {
                "document_id": doc_id,
                "filename": summary["filename"],
                "total_pages": summary["max_page"],
                "pages_with_text": summary["max_page"],
                "total_chunks": summary["chunk_count"],
                "file_size": file_size,
                "uploaded_at": datetime.now(timezone.utc).isoformat(),
                "status": "ready"
            }
    except Exception:
        pass

    return registry


def list_documents() -> list[dict[str, Any]]:
    registry = _read_registry()
    docs = list(registry.values())
    # Sort by uploaded_at descending
    docs.sort(key=lambda d: d.get("uploaded_at", ""), reverse=True)
    return docs


def get_document(document_id: str) -> dict[str, Any] | None:
    registry = _read_registry()
    return registry.get(document_id)


def save_document(document_data: dict[str, Any]) -> None:
    registry = _read_registry()
    doc_id = document_data["document_id"]
    registry[doc_id] = document_data
    _write_registry(registry)


def remove_document(document_id: str) -> bool:
    registry = _read_registry()
    if document_id in registry:
        del registry[document_id]
        _write_registry(registry)
        return True
    return False
