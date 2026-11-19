
from pathlib import Path

import chromadb


# Store the database in the project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
VECTOR_DB_PATH = PROJECT_ROOT / "vector_db"

# Create a persistent Chroma client
client = chromadb.PersistentClient(
    path=str(VECTOR_DB_PATH)
)

# Create or retrieve our collection
collection = client.get_or_create_collection(
    name="pdf_chunks",
    configuration={
        "hnsw": {
            "space": "cosine"
        }
    }
)


def store_chunks(
    embedded_chunks: list[dict],
    document_id: str,
    filename: str
) -> int:

    if not embedded_chunks:
        return 0

    batch_size = 100

    for start in range(0, len(embedded_chunks), batch_size):

        batch = embedded_chunks[start:start + batch_size]

        ids = [
            f"{document_id}-{chunk['chunk_id']}"
            for chunk in batch
        ]

        documents = [
            chunk["text"]
            for chunk in batch
        ]

        embeddings = [
            chunk["embedding"]
            for chunk in batch
        ]

        metadatas = [
            {
                "document_id": document_id,
                "filename": filename,
                "page_number": chunk["page_number"],
                "chunk_index": chunk["chunk_index"]
            }
            for chunk in batch
        ]

        collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    return len(embedded_chunks)


def search_similar_chunks(
    query_embedding: list[float],
    n_results: int = 5,
    document_id: str | None = None
) -> list[dict]:

    if not query_embedding:
        raise ValueError("Query embedding cannot be empty.")

    if n_results <= 0:
        raise ValueError("n_results must be positive.")

    total = collection.count()

    if total == 0:
        return []

    query_args = {
        "query_embeddings": [query_embedding],
        "n_results": min(n_results, total),
        "include": ["documents", "metadatas", "distances"]
    }

    if document_id:
        query_args["where"] = {
            "document_id": document_id
        }

    results = collection.query(**query_args)

    matches = []

    for i, chunk_id in enumerate(results["ids"][0]):

        if chunk_id is None:
            continue

        matches.append({
            "id": chunk_id,
            "text": results["documents"][0][i],
            "metadata": results["metadatas"][0][i],
            "distance": results["distances"][0][i]
        })

    return matches


def delete_document_chunks(document_id: str) -> None:
    if not document_id:
        return
    collection.delete(where={"document_id": document_id})

