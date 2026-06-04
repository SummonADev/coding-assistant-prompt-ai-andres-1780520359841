"""FastAPI application entry point for M&A Due Diligence Tool."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from edgar.client import get_filing_info
from edgar.parser import download_and_parse_filing
from analysis.embedder import embed_chunks
from analysis.retriever import build_or_load_collection
from analysis.memo_builder import build_memo
from utils.cache import get_cached_sections, save_sections_cache

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    logger.info("M&A Due Diligence API starting up")
    yield
    logger.info("M&A Due Diligence API shutting down")


app = FastAPI(
    title="M&A Due Diligence API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    """Request body for the /analyze endpoint."""
    ticker: str


@app.post("/analyze")
async def analyze(request: AnalyzeRequest) -> dict:
    """Analyze a company's 10-K filing and return a structured M&A memo.

    Args:
        request: Contains the stock ticker symbol.

    Returns:
        A dict with 'metadata' and 'memo' keys matching the frontend schema.

    Raises:
        HTTPException: On ticker not found, rate limit, or analysis failure.
    """
    ticker = request.ticker.strip().upper()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker cannot be empty")

    logger.info("Starting analysis for ticker: %s", ticker)

    try:
        filing_info = get_filing_info(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))

    logger.info("Filing info retrieved: %s", filing_info)

    cached = get_cached_sections(ticker)
    if cached is not None:
        logger.info("Using cached filing sections for %s", ticker)
        sections = cached
    else:
        try:
            sections = download_and_parse_filing(
                filing_info["filing_url"], ticker
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse filing: {str(e)}",
            )
        save_sections_cache(ticker, sections)

    logger.info(
        "Parsed %d sections for %s", len(sections), ticker
    )

    try:
        collection = build_or_load_collection(
            ticker=ticker,
            sections=sections,
            filing_type=filing_info["filing_type"],
            fiscal_year=filing_info["filing_date"][:4],
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Embedding/retrieval setup failed: {str(e)}",
        )

    try:
        memo_result = build_memo(
            collection=collection,
            filing_info=filing_info,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Memo generation failed: {str(e)}",
        )

    logger.info("Analysis complete for %s", ticker)
    return memo_result


@app.get("/health")
async def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}
