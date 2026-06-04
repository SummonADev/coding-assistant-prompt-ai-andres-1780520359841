"""ChromaDB vector store: build, persist, and query filing chunk embeddings."""

import logging
import os
from typing import Optional

import chromadb
from chromadb import Collection

from analysis.embedder import chunk_sections, embed_chunks, embed_query

logger = logging.getLogger(__name__)

CHROMA_BASE_DIR = "./chroma_db"
TOP_K = 6


def _collection_name(ticker: str) -> str:
    """Generate a ChromaDB collection name for a ticker.

    Args:
        ticker: Stock ticker symbol.

    Returns:
        Sanitized collection name string.
    """
    return f"filing_{ticker.upper()}"


def _get_client(ticker: str) -> chromadb.PersistentClient:
    """Create a persistent ChromaDB client scoped to the ticker.

    Args:
        ticker: Stock ticker symbol.

    Returns:
        ChromaDB PersistentClient instance.
    """
    db_path = os.path.join(CHROMA_BASE_DIR, ticker.upper())
    os.makedirs(db_path, exist_ok=True)
    return chromadb.PersistentClient(path=db_path)


def _collection_is_populated(collection: Collection) -> bool:
    """Check whether a ChromaDB collection already has documents.

    Args:
        collection: ChromaDB Collection object.

    Returns:
        True if collection has at least one document.
    """
    return collection.count() > 0


def build_or_load_collection(
    ticker: str,
    sections: dict[str, str],
    filing_type: str,
    fiscal_year: str,
) -> Collection:
    """Return a ChromaDB collection for the ticker, building it if necessary.

    If the collection already exists and is populated, returns it immediately
    (skipping re-embedding). Otherwise, chunks, embeds, and stores all sections.

    Args:
        ticker: Stock ticker symbol.
        sections: Dict of section label -> text.
        filing_type: e.g. '10-K'.
        fiscal_year: Four-digit year string.

    Returns:
        Populated ChromaDB Collection ready for querying.
    """
    client = _get_client(ticker)
    col_name = _collection_name(ticker)
    collection = client.get_or_create_collection(
        name=col_name,
        metadata={"hnsw:space": "cosine"},
    )

    if _collection_is_populated(collection):
        logger.info(
            "ChromaDB collection '%s' already populated (%d docs). Skipping re-embed.",
            col_name,
            collection.count(),
        )
        return collection

    logger.info("Building ChromaDB collection '%s'...", col_name)
    chunks = chunk_sections(sections, ticker, filing_type, fiscal_year)
    embedded = embed_chunks(chunks)

    ids = [f"{ticker}_{c['section']}_{c['chunk_index']}" for c in embedded]
    documents = [c["text"] for c in embedded]
    embeddings = [c["embedding"] for c in embedded]
    metadatas = [
        {
            "ticker": c["ticker"],
            "filing_type": c["filing_type"],
            "section": c["section"],
            "chunk_index": c["chunk_index"],
            "fiscal_year": c["fiscal_year"],
        }
        for c in embedded
    ]

    # Upsert in batches to avoid memory issues
    batch_size = 100
    for i in range(0, len(ids), batch_size):
        collection.upsert(
            ids=ids[i : i + batch_size],
            documents=documents[i : i + batch_size],
            embeddings=embeddings[i : i + batch_size],
            metadatas=metadatas[i : i + batch_size],
        )

    logger.info(
        "Stored %d chunks in collection '%s'", len(ids), col_name
    )
    return collection


def retrieve(
    collection: Collection,
    query: str,
    n_results: int = TOP_K,
    section_filter: Optional[str] = None,
) -> str:
    """Retrieve the most relevant chunks for a query and return as joined text.

    Args:
        collection: ChromaDB Collection to query.
        query: Natural language query string.
        n_results: Number of top results to return.
        section_filter: Optional section name to filter results to.

    Returns:
        Concatenated text of the top matching chunks.
    """
    query_embedding = embed_query(query)
    where: Optional[dict] = {"section": section_filter} if section_filter else None

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where,
        include=["documents"],
    )

    docs: list[str] = results.get("documents", [[]])[0]
    return "\n\n---\n\n".join(docs)
