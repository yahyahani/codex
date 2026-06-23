FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# -- dependency layer: only rebuilds when pyproject.toml changes --
COPY pyproject.toml .
RUN python -c "import tomllib,subprocess,sys; deps=tomllib.load(open('pyproject.toml','rb'))['project']['dependencies']; subprocess.run([sys.executable,'-m','pip','install','--no-cache-dir']+deps,check=True)"

# -- application source --
COPY src/ src/
RUN pip install --no-cache-dir -e . --no-deps

# Pre-download the embedding model so the first `index` run is instant
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# /repo  → mount your codebase here (read-only)
# /data  → persistent volume for ChromaDB
VOLUME ["/repo", "/data"]

ENV CHROMA_DB_PATH=/data/chroma_db

ENTRYPOINT ["codebase-qa"]
CMD ["--help"]
