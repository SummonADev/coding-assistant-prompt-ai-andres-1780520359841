# M&A Due Diligence Tool — Running Guide

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- An **Anthropic API key** (get one at https://console.anthropic.com)

---

## 1. Clone & set up the backend

```bash
# From the project root, move into the backend directory
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # macOS / Linux
# .venv\Scripts\activate       # Windows PowerShell

# Install all Python dependencies
pip install -r requirements.txt

# Create the .env file with your Anthropic key
echo "ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx" > .env
```

---

## 2. Set up the frontend

```bash
# From the project root
npm install
```

---

## 3. Run both servers simultaneously

You need **two terminal windows / tabs** open at the same time.

### Terminal A — FastAPI backend (port 8000)

```bash
cd backend
source .venv/bin/activate      # Windows: .venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     M&A Due Diligence API starting up
```

### Terminal B — Vite frontend (port 5173)

```bash
# From the project root
npm run dev
```

You should see:
```
  VITE v6.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

## 4. Verify the backend before using the UI

With the backend running, test the data pipeline by running the test script:

```bash
# In a third terminal (backend venv activated)
cd backend
python test_backend.py AAPL
```

This will print the raw parsed 10-K sections so you can confirm SEC EDGAR
fetching and HTML parsing work before touching the AI layer.

Once that looks good, open **http://localhost:5173** in your browser, type a
ticker (e.g. `AAPL`, `MSFT`, `NVDA`), and click **Analyze**.

---

## 5. How the two servers talk to each other

```
Browser (port 5173)
  └─ POST http://localhost:8000/analyze  { "ticker": "AAPL" }
        └─ FastAPI (port 8000)
              ├─ SEC EDGAR API  →  fetches 10-K HTML
              ├─ ChromaDB       →  ./backend/chroma_db/AAPL/
              ├─ sentence-transformers  →  local embeddings
              └─ Anthropic API  →  Claude generates memo sections
```

CORS is already configured in `backend/main.py` to allow requests from
`http://localhost:5173`.

---

## 6. Performance notes

| Run | Expected time |
|-----|---------------|
| First analysis for a ticker | 30 – 90 s (downloads + embeds + 5× Claude calls) |
| Repeat analysis (cached) | < 10 s (skip download + skip re-embedding) |

Cached filing text lives in `backend/.filing_cache/`.
Cached embeddings live in `backend/chroma_db/{TICKER}/`.

Delete either folder to force a fresh fetch.

---

## 7. Environment variables reference

| File | Variable | Required |
|------|----------|----------|
| `backend/.env` | `ANTHROPIC_API_KEY` | ✅ Yes |

The frontend has no environment variables — it always points to
`http://localhost:8000`.

---

## 8. Stopping both servers

Press **Ctrl + C** in each terminal window.
