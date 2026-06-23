# Docker Setup

Run `codebase-qa` in a container — no local Python, no dependency conflicts.
The image bundles all dependencies (tree-sitter, sentence-transformers, ChromaDB)
and pre-downloads the embedding model at build time.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 24+
- A `.env` file with your Anthropic API key:

```bash
cp .env.example .env
# edit .env and set: ANTHROPIC_API_KEY=sk-ant-...
```

---

## Build the image

```bash
docker compose build
```

The build takes ~3–5 minutes the first time (installs deps + downloads the
embedding model). Subsequent builds are fast — the dependency layer is only
rebuilt when `pyproject.toml` changes, and the model layer is cached.

---

## Index a codebase

Edit the `volumes` section in `docker-compose.yml` to point at your repo, then:

```bash
docker compose run --rm app index /repo
```

Or pass the path directly without editing compose:

```bash
docker run --rm \
  --env-file .env \
  -v /absolute/path/to/your/repo:/repo:ro \
  -v cqa-data:/data \
  codebase-qa index /repo
```

Use `--collection` to name the index (default: `codebase`):

```bash
docker compose run --rm app index /repo --collection myproject
```

---

## Ask a question

The named volume `chroma_data` keeps the index between runs:

```bash
docker compose run --rm app ask "How does authentication work?"
docker compose run --rm app ask "Hoe werkt de chunking?" --collection myproject
```

---

## Reset the database

```bash
docker compose down -v   # removes the chroma_data volume
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required for the `ask` command (Milestone 4) |
| `CHROMA_DB_PATH` | `/data/chroma_db` | ChromaDB storage path inside the container |

The API key is read from `.env` via `env_file` in `docker-compose.yml`.
It is never baked into the image or committed to git.
