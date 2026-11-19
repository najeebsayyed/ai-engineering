
def chunk_pages(
    pages: list[dict],
    chunk_size: int = 1000,
    overlap: int = 150
) -> list[dict]:

    if chunk_size <= 0:
        raise ValueError("Chunk size must be positive.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("Overlap must be smaller than chunk size.")

    chunks = []

    for page in pages:
        text = page["text"].strip()
        page_number = page["page_number"]

        if not text:
            continue

        start = 0
        chunk_index = 0

        while start < len(text):

            end = min(start + chunk_size, len(text))

            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "chunk_id": f"page-{page_number}-chunk-{chunk_index + 1}",
                    "page_number": page_number,
                    "chunk_index": chunk_index,
                    "text": chunk_text
                })

                chunk_index += 1

            if end == len(text):
                break

            start = end - overlap

    return chunks
