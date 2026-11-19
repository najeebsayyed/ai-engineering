
from pathlib import Path
import pymupdf


def extract_pdf_text(pdf_path: str | Path) -> list[dict]:
    pages = []

    with pymupdf.open(pdf_path) as pdf:

        if pdf.needs_pass:
            raise ValueError("Password-protected PDFs are not supported yet.")

        for page_number, page in enumerate(pdf, start=1):

            text = page.get_text("text", sort=True).strip()

            pages.append({
                "page_number": page_number,
                "text": text
            })

    return pages
