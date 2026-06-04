"""Embed text chunks using sentence-transformers (all-MiniLM-L6-v2)."""

import logging
from typing import Optional

from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 150

_model: Optional[SentenceTransformer] = None


def _get_model() -> SentenceTransformer:
    """Lazily load and cache the sentence-transformers model.

    Returns:
        Loaded SentenceTransformer model.
    """
    global _model
    if _model is None:
        logger.info("Loading sentence-transformers model: %s", EMBED_MODEL_NAME)
        _model = SentenceTransformer(EMBED_MODEL_NAME)
        logger.info("Model loaded")
    return _model


def chunk_sections(
    sections: dict[str, str],
    ticker: str,
    filing_type: str,
    fiscal_year: str,
) -> list[dict]:
    """Split section texts into overlapping chunks with metadata.

    Applies RecursiveCharacterTextSplitter within each section,
    preserving section-level metadata per chunk.

    Args:
        sections: Dict mapping section label to cleaned text.
        ticker: Stock ticker symbol.
        filing_type: e.g. '10-K'.
        fiscal_year: Four-digit year string.

    Returns:
        List of dicts, each with keys: 'text', 'ticker', 'filing_type',
        'section', 'chunk_index', 'fiscal_year'.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    all_chunks: list[dict] = []
    for section_name, text in sections.items():
        if not text.strip():
            continue
        sub_chunks = splitter.split_text(text)
        for idx, chunk_text in enumerate(sub_chunks):
            all_chunks.append({
                "text": chunk_text,
                "ticker": ticker,
                "filing_type": filing_type,
                "section": section_name,
                "chunk_index": idx,
                "fiscal_year": fiscal_year,
            })

    logger.info(
        "Created %d chunks across %d sections for %s",
        len(all_chunks),
        len(sections),
        ticker,
    )
    return all_chunks


def embed_chunks(chunks: list[dict]) -> list[dict]:
    """Add embedding vectors to each chunk dict in-place.

    Args:
        chunks: List of chunk dicts with a 'text' key.

    Returns:
        Same list with 'embedding' key added to each dict.
    """
    model = _get_model()
    texts = [c["text"] for c in chunks]
    logger.info("Embedding %d chunks...", len(texts))
    embeddings = model.encode(texts, show_progress_bar=False, batch_size=64)
    for chunk, emb in zip(chunks, embeddings):
        chunk["embedding"] = emb.tolist()
    logger.info("Embedding complete")
    return chunks


def embed_query(query: str) -> list[float]:
    """Embed a single query string for similarity search.

    Args:
        query: The query text.

    Returns:
        Embedding vector as a list of floats.
    """
    model = _get_model()
    return model.encode(query).tolist()
