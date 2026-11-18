
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

if not API_KEY:
    raise RuntimeError("OPENAI_API_KEY is missing from .env")

client = OpenAI(api_key=API_KEY)


def embed_chunks(
    chunks: list[dict],
    batch_size: int = 100
) -> list[dict]:

    if batch_size <= 0:
        raise ValueError("Batch size must be positive.")

    embedded_chunks = []

    for start in range(0, len(chunks), batch_size):

        batch = [
            chunk
            for chunk in chunks[start:start + batch_size]
            if chunk.get("text", "").strip()
        ]

        if not batch:
            continue

        texts = [
            chunk["text"].replace("\n", " ").strip()
            for chunk in batch
        ]

        response = client.embeddings.create(
            model=MODEL,
            input=texts
        )

        for item in response.data:
            chunk = batch[item.index]

            embedded_chunks.append({
                **chunk,
                "embedding": item.embedding
            })

    return embedded_chunks


def embed_query(query: str) -> list[float]:

    if not query.strip():
        raise ValueError("Query cannot be empty.")

    response = client.embeddings.create(
        model=MODEL,
        input=query.strip()
    )

    return response.data[0].embedding

