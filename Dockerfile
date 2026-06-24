# ── Stage 1: build the React frontend ──────────────────────────────────────
FROM node:20-slim AS frontend-build
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python application ─────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# -- dependency layer: only rebuilds when pyproject.toml changes --
COPY pyproject.toml .
RUN python -c "import tomllib,subprocess,sys; data=tomllib.load(open('pyproject.toml','rb')); deps=data['project']['dependencies']+data['project']['optional-dependencies']['api']; subprocess.run([sys.executable,'-m','pip','install','--no-cache-dir']+deps,check=True)"

# -- application source --
COPY src/ src/
RUN pip install --no-cache-dir -e . --no-deps

# -- built frontend from stage 1 --
COPY --from=frontend-build /frontend/dist/ frontend/

# Pre-download the embedding model so the first `index` run is instant
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# /repo  → mount your codebase here (read-only)
# /data  → persistent volume for ChromaDB
VOLUME ["/repo", "/data"]

ENV CHROMA_DB_PATH=/data/chroma_db

ENTRYPOINT ["codebase-qa"]
CMD ["--help"]
