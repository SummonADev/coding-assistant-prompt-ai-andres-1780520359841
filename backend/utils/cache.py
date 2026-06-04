"""Local filesystem cache for parsed filing sections."""

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

CACHE_DIR = "./filing_cache"


def _cache_path(ticker: str) -> str:
    """Return the filesystem path for a ticker's cached sections file.

    Args:
        ticker: Stock ticker symbol.

    Returns:
        Absolute path string to the JSON cache file.
    """
    os.makedirs(CACHE_DIR, exist_ok=True)
    return os.path.join(CACHE_DIR, f"{ticker.upper()}_sections.json")


def get_cached_sections(ticker: str) -> Optional[dict[str, str]]:
    """Load cached filing sections for a ticker if they exist.

    Args:
        ticker: Stock ticker symbol.

    Returns:
        Dict of section label -> text, or None if no cache exists.
    """
    path = _cache_path(ticker)
    if not os.path.exists(path):
        logger.info("No cache found for %s", ticker)
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            data: dict[str, str] = json.load(f)
        logger.info("Loaded cached sections for %s (%d sections)", ticker, len(data))
        return data
    except Exception as exc:
        logger.warning("Failed to load cache for %s: %s", ticker, exc)
        return None


def save_sections_cache(ticker: str, sections: dict[str, str]) -> None:
    """Save parsed filing sections to the local cache.

    Args:
        ticker: Stock ticker symbol.
        sections: Dict of section label -> text.
    """
    path = _cache_path(ticker)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(sections, f, ensure_ascii=False, indent=2)
        logger.info("Cached %d sections for %s at %s", len(sections), ticker, path)
    except Exception as exc:
        logger.warning("Failed to cache sections for %s: %s", ticker, exc)


def clear_cache(ticker: str) -> bool:
    """Delete the cached sections for a ticker.

    Args:
        ticker: Stock ticker symbol.

    Returns:
        True if the cache file was deleted, False if it did not exist.
    """
    path = _cache_path(ticker)
    if os.path.exists(path):
        os.remove(path)
        logger.info("Cleared cache for %s", ticker)
        return True
    return False
