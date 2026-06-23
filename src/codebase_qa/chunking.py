from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

FALLBACK_CHUNK_SIZE = 40
FALLBACK_OVERLAP = 10

_TOP_LEVEL_PYTHON = {"function_definition", "class_definition", "decorated_definition"}


@dataclass
class Chunk:
    file: Path
    start_line: int   # 1-indexed, inclusive
    end_line: int     # 1-indexed, inclusive
    text: str


def chunk_file(path: Path) -> list[Chunk]:
    """Split a source file into semantic chunks.

    Python files are split per top-level function/class using tree-sitter.
    All other extensions fall back to fixed-size line windows with overlap.
    """
    text = path.read_text(errors="replace")
    if not text.strip():
        return []

    if path.suffix.lower() == ".py":
        try:
            chunks = _chunk_python(path, text)
            if chunks:
                return chunks
        except Exception:
            pass

    return _chunk_by_lines(path, text)


def _chunk_python(path: Path, text: str) -> list[Chunk]:
    import tree_sitter_python as tspython
    from tree_sitter import Language, Parser

    parser = Parser(Language(tspython.language()))
    tree = parser.parse(text.encode("utf-8", errors="replace"))

    chunks = []
    for node in tree.root_node.children:
        if node.type in _TOP_LEVEL_PYTHON:
            chunks.append(Chunk(
                file=path,
                start_line=node.start_point[0] + 1,
                end_line=node.end_point[0] + 1,
                text=text[node.start_byte:node.end_byte],
            ))
    return chunks


def _chunk_by_lines(
    path: Path,
    text: str,
    size: int = FALLBACK_CHUNK_SIZE,
    overlap: int = FALLBACK_OVERLAP,
) -> list[Chunk]:
    lines = text.splitlines()
    if not lines:
        return []

    step = max(1, size - overlap)
    chunks = []
    i = 0
    while i < len(lines):
        window = lines[i : i + size]
        chunks.append(Chunk(
            file=path,
            start_line=i + 1,
            end_line=i + len(window),
            text="\n".join(window),
        ))
        i += step
    return chunks
