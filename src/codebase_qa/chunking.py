# Milestone 2 — tree-sitter-based code chunking
from dataclasses import dataclass
from pathlib import Path


@dataclass
class Chunk:
    file: Path
    start_line: int
    end_line: int
    text: str


def chunk_file(path: Path) -> list[Chunk]:
    """Split a source file into semantic chunks. Implemented in Milestone 2."""
    raise NotImplementedError
