from __future__ import annotations

from functools import lru_cache

from sentence_transformers import SentenceTransformer

_MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def _model() -> SentenceTransformer:
    return SentenceTransformer(_MODEL_NAME)


def embed(texts: list[str]) -> list[list[float]]:
    """Return L2-normalised embedding vectors (384-dim) for each input string."""
    if not texts:
        return []
    vecs = _model().encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return [v.tolist() for v in vecs]
