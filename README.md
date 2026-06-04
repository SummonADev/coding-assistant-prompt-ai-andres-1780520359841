# M&A Due Diligence Tool

A full-stack AI-powered M&A due diligence tool. The React frontend fetches real
10-K filings from SEC EDGAR, processes them through a RAG pipeline, and
generates structured memos via the Claude API.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 + |
| Python | 3.10 + |
| pip | latest |

---

## 1 — Backend setup

```bash
# From the project root
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Anthropic API key
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env
```

### Start the FastAPI server

```bash
# Still inside backend/ with the venv active
uvicorn main:app --reload --port 8000
```

Verify it is running:

```
GET http://localhost:8000/health  →  { "status": "ok" }
```

---

## 2 — Frontend setup

Open a **second terminal** at the project root.

```bash
npm install
npm run dev
```

Vite starts on **http://localhost:5173**.

All `/analyze` and `/health` requests from the browser are automatically
proxied to `http://localhost:8000` by the Vite dev-server proxy defined in
`vite.config.ts` — no CORS issues, no hard-coded `localhost:8000` URLs in
browser requests.

---

## 3 — Running both servers at once (optional)

Install `concurrently` once:

```bash
npm install --save-dev concurrently
```

Add this script to `package.json`:

```json
"dev:full": "concurrently -n frontend,backend -c cyan,yellow \"npm run dev\" \"cd backend && .venv/bin/uvicorn main:app --reload --port 8000\""
```

Then run:

```bash
npm run dev:full
```

---

## 4 — Test the data pipeline (no AI layer)

```bash
cd backend
python test_backend.py AAPL
```

This prints the raw parsed 10-K sections to the console so you can verify
the SEC EDGAR fetch and parser before any Claude calls are made.

---

## 5 — Production build

```bash
# Build the React app
npm run build        # outputs to dist/

# Serve with Nginx (see Dockerfile) or:
npm run preview      # serves dist/ locally on port 4173
```

For production, point Nginx to serve `dist/` as static files **and** reverse-
proxy `/analyze` → `localhost:8000` so the frontend bundle needs zero
configuration changes.

---

## Environment variables

| File | Variable | Required |
|------|----------|----------|
| `backend/.env` | `ANTHROPIC_API_KEY` | ✅ Yes |

No frontend `.env` file is needed — the Vite proxy handles routing.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank production window / white screen | Make sure `npm run dev` is running and visit **http://localhost:5173**, not port 8000 |
| `❌ Backend error (HTTP 404)` on a valid ticker | The backend is not running — start `uvicorn` first |
| `❌ Failed to fetch` in the browser | The Vite dev server is not proxying correctly — confirm `vite.config.ts` has the proxy block |
| `429 rate limited` | SEC EDGAR is throttling — wait 30 s and retry |
| Slow first run | Normal — sentence-transformers downloads the model on first use; subsequent runs use the ChromaDB cache |
