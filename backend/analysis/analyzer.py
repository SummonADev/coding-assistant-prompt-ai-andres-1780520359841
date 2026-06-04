"""Claude API functions for generating each section of the M&A memo."""

import logging
import os
from pathlib import Path
from typing import Optional

import anthropic
from chromadb import Collection

from analysis.retriever import retrieve

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 1500
SYSTEM_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "system_prompt.txt"


def _get_client() -> anthropic.Anthropic:
    """Create an Anthropic client using the environment API key.

    Returns:
        Anthropic client instance.

    Raises:
        RuntimeError: If ANTHROPIC_API_KEY is not set.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY environment variable is not set. "
            "Add it to backend/.env"
        )
    return anthropic.Anthropic(api_key=api_key)


def _load_system_prompt() -> str:
    """Load the system prompt from disk.

    Returns:
        System prompt text string.
    """
    if SYSTEM_PROMPT_PATH.exists():
        return SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")
    return (
        "You are a senior M&A analyst at a top-tier investment bank. "
        "Produce clear, structured, professional financial analysis memo sections. "
        "Be specific, cite numbers where available, and avoid filler language."
    )


def _call_claude(system_prompt: str, user_prompt: str) -> str:
    """Make a single Claude API call and return the text response.

    Args:
        system_prompt: The system prompt defining Claude's role.
        user_prompt: The user-facing prompt with context and task.

    Returns:
        The generated text from Claude.
    """
    client = _get_client()
    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return response.content[0].text


def analyze_financial_health(
    collection: Collection,
    company_name: str,
    ticker: str,
    fiscal_year: str,
) -> str:
    """Generate the financial health section of the memo.

    Args:
        collection: ChromaDB collection with filing chunks.
        company_name: Official company name.
        ticker: Stock ticker.
        fiscal_year: Fiscal year being analyzed.

    Returns:
        Markdown-formatted financial health analysis string.
    """
    context = retrieve(
        collection,
        "revenue profit net income operating cash flow margins balance sheet debt liquidity",
        n_results=6,
    )
    system_prompt = _load_system_prompt()
    user_prompt = (
        f"Company: {company_name} ({ticker}), Fiscal Year: {fiscal_year}\n\n"
        f"Relevant 10-K excerpts:\n{context}\n\n"
        "Write a detailed financial health section for an M&A due diligence memo. "
        "Cover: revenue trends, profitability (margins), cash flow quality, "
        "debt/liquidity, and an overall financial verdict. Use markdown headers and bullet points."
    )
    return _call_claude(system_prompt, user_prompt)


def analyze_risk_factors(
    collection: Collection,
    company_name: str,
    ticker: str,
) -> list[dict]:
    """Generate a structured list of risk factors.

    Args:
        collection: ChromaDB collection with filing chunks.
        company_name: Official company name.
        ticker: Stock ticker.

    Returns:
        List of dicts with keys: name, description, impact (High/Medium/Low).
    """
    import json

    context = retrieve(
        collection,
        "risk factors uncertainties competitive threats regulatory legal operational",
        n_results=6,
        section_filter="ITEM_1A",
    )
    if not context.strip():
        context = retrieve(
            collection,
            "risk factors uncertainties competitive threats regulatory legal",
            n_results=6,
        )

    system_prompt = _load_system_prompt()
    user_prompt = (
        f"Company: {company_name} ({ticker})\n\n"
        f"Relevant 10-K risk factor excerpts:\n{context}\n\n"
        "Identify the 5 most material risk factors for an M&A acquirer. "
        "Return ONLY a valid JSON array (no markdown, no prose) with this exact shape:\n"
        '[{"name": "...", "description": "...", "impact": "High"|"Medium"|"Low"}, ...]'
    )
    raw = _call_claude(system_prompt, user_prompt)
    try:
        # Strip any accidental markdown code fences
        clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        return json.loads(clean)
    except Exception as exc:
        logger.warning("Failed to parse risk factors JSON: %s — raw: %s", exc, raw[:300])
        return [
            {
                "name": "Risk Factor Parsing Error",
                "description": raw[:500],
                "impact": "Medium",
            }
        ]


def analyze_red_flags(
    collection: Collection,
    company_name: str,
    ticker: str,
) -> list[str]:
    """Identify red flags and audit/accounting concerns.

    Args:
        collection: ChromaDB collection with filing chunks.
        company_name: Official company name.
        ticker: Stock ticker.

    Returns:
        List of strings, each describing a red flag or monitoring item.
    """
    context_controls = retrieve(
        collection,
        "internal controls material weakness going concern audit restatement",
        n_results=3,
    )
    context_legal = retrieve(
        collection,
        "litigation legal proceedings regulatory investigation penalty",
        n_results=3,
    )
    context = context_controls + "\n\n---\n\n" + context_legal

    system_prompt = _load_system_prompt()
    user_prompt = (
        f"Company: {company_name} ({ticker})\n\n"
        f"Relevant 10-K excerpts:\n{context}\n\n"
        "Identify all material red flags an M&A acquirer should be aware of: "
        "accounting irregularities, going concern language, material weaknesses, "
        "major litigation, restatements, related-party issues, or governance concerns. "
        "If none exist, say so clearly. "
        "Return a markdown-formatted narrative (not a JSON array). "
        "Start with an overall red flag severity assessment."
    )
    result = _call_claude(system_prompt, user_prompt)
    return [result]


def analyze_competitive_position(
    collection: Collection,
    company_name: str,
    ticker: str,
) -> str:
    """Generate a competitive positioning assessment.

    Args:
        collection: ChromaDB collection with filing chunks.
        company_name: Official company name.
        ticker: Stock ticker.

    Returns:
        Markdown-formatted competitive position analysis string.
    """
    context = retrieve(
        collection,
        "competition competitors market share competitive advantage industry position strategy",
        n_results=6,
        section_filter="ITEM_1",
    )
    if not context.strip():
        context = retrieve(
            collection,
            "competition competitors market share competitive advantage strategy",
            n_results=6,
        )

    system_prompt = _load_system_prompt()
    user_prompt = (
        f"Company: {company_name} ({ticker})\n\n"
        f"Relevant 10-K excerpts:\n{context}\n\n"
        "Write a competitive positioning section for an M&A due diligence memo. "
        "Cover: primary markets, competitive advantages/moats, key competitors, "
        "market position, and strategic initiatives. Use markdown headers and bullet points."
    )
    return _call_claude(system_prompt, user_prompt)


def analyze_executive_summary(
    company_name: str,
    ticker: str,
    financial_health: str,
    risk_factors: list[dict],
    red_flags: list[str],
    competitive_position: str,
    deal_signal: str,
) -> str:
    """Generate the executive summary section synthesizing all other sections.

    Args:
        company_name: Official company name.
        ticker: Stock ticker.
        financial_health: Generated financial health text.
        risk_factors: Generated risk factors list.
        red_flags: Generated red flags list.
        competitive_position: Generated competitive position text.
        deal_signal: One of 'Favorable', 'Neutral', 'Cautious'.

    Returns:
        Concise executive summary paragraph string.
    """
    import json
    risks_text = json.dumps(risk_factors, indent=2)
    red_text = "\n".join(red_flags)

    system_prompt = _load_system_prompt()
    user_prompt = (
        f"Company: {company_name} ({ticker})\n"
        f"Overall Deal Signal: {deal_signal}\n\n"
        f"Financial Health Summary:\n{financial_health[:800]}\n\n"
        f"Risk Factors:\n{risks_text[:600]}\n\n"
        f"Red Flags:\n{red_text[:400]}\n\n"
        f"Competitive Position:\n{competitive_position[:600]}\n\n"
        "Write a concise 3-5 sentence executive summary for the M&A due diligence memo. "
        "Capture: what the company does, key financial strength, the most critical risk, "
        "and deal attractiveness rationale. No markdown headers — plain paragraph prose."
    )
    return _call_claude(system_prompt, user_prompt)


def determine_deal_signal(
    collection: Collection,
    company_name: str,
    ticker: str,
    financial_health: str,
    risk_factors: list[dict],
    red_flags: list[str],
) -> str:
    """Determine the overall deal attractiveness signal.

    Args:
        collection: ChromaDB collection (unused directly, kept for consistency).
        company_name: Official company name.
        ticker: Stock ticker.
        financial_health: Generated financial health text.
        risk_factors: List of risk factor dicts.
        red_flags: List of red flag strings.

    Returns:
        One of: 'Favorable', 'Neutral', 'Cautious'.
    """
    import json
    system_prompt = _load_system_prompt()
    user_prompt = (
        f"Company: {company_name} ({ticker})\n\n"
        f"Financial Health (excerpt):\n{financial_health[:600]}\n\n"
        f"Risk Factors:\n{json.dumps(risk_factors, indent=2)[:500]}\n\n"
        f"Red Flags:\n{''.join(red_flags)[:400]}\n\n"
        "Based on this analysis, classify the overall M&A deal attractiveness as EXACTLY ONE of: "
        "'Favorable', 'Neutral', or 'Cautious'. "
        "Return ONLY the single word — no explanation, no punctuation."
    )
    raw = _call_claude(system_prompt, user_prompt).strip()
    if raw in ("Favorable", "Neutral", "Cautious"):
        return raw
    # Fallback: scan for keywords
    lower = raw.lower()
    if "favorable" in lower:
        return "Favorable"
    if "cautious" in lower:
        return "Cautious"
    return "Neutral"
