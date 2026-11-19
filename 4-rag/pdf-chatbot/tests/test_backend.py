import io
import os
import unittest

# Ensure unit tests can initialize even if local .env is not yet configured
os.environ.setdefault("OPENAI_API_KEY", "mock-key-for-test-suite")

from fastapi.testclient import TestClient

from app.main import app
from app.chunking import chunk_pages
from app.documents import (
    save_document,
    get_document,
    list_documents,
    remove_document,
)


class TestBackendIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_home_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertEqual(data["message"], "PDF Chatbot API is running!")

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("total_documents", data)
        self.assertIn("total_vectors", data)

    def test_get_documents_endpoint(self):
        response = self.client.get("/documents")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("documents", data)
        self.assertIsInstance(data["documents"], list)

    def test_upload_rejects_non_pdf_extension(self):
        file_content = b"Some random text data"
        response = self.client.post(
            "/upload",
            files={"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Only PDF files are allowed", response.json()["detail"])

    def test_upload_rejects_invalid_pdf_content(self):
        fake_content = b"Not a real PDF header"
        response = self.client.post(
            "/upload",
            files={"file": ("fake.pdf", io.BytesIO(fake_content), "application/pdf")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid PDF file", response.json()["detail"])

    def test_search_rejects_empty_question(self):
        response = self.client.post(
            "/search",
            json={"question": "   ", "top_k": 5}
        )
        self.assertEqual(response.status_code, 400)

    def test_chat_rejects_empty_question(self):
        response = self.client.post(
            "/chat",
            json={"question": "   ", "top_k": 5}
        )
        self.assertEqual(response.status_code, 400)

    def test_chunking_logic(self):
        pages = [
            {"page_number": 1, "text": "This is page one of the test document. " * 30},
            {"page_number": 2, "text": "This is page two of the document. " * 20},
        ]
        chunks = chunk_pages(pages, chunk_size=500, overlap=50)
        self.assertGreater(len(chunks), 1)
        for chunk in chunks:
            self.assertIn("chunk_id", chunk)
            self.assertIn("page_number", chunk)
            self.assertIn("text", chunk)
            self.assertLessEqual(len(chunk["text"]), 550)

    def test_documents_registry_lifecycle(self):
        test_id = "test-doc-unit-id-12345"
        meta = {
            "document_id": test_id,
            "filename": "unit_test.pdf",
            "total_pages": 3,
            "total_chunks": 5,
            "uploaded_at": "2026-11-19T00:00:00Z",
            "status": "ready"
        }
        save_document(meta)
        retrieved = get_document(test_id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["filename"], "unit_test.pdf")

        all_docs = list_documents()
        self.assertTrue(any(d["document_id"] == test_id for d in all_docs))

        removed = remove_document(test_id)
        self.assertTrue(removed)
        self.assertIsNone(get_document(test_id))


if __name__ == "__main__":
    unittest.main()
