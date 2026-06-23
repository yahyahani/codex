from pathlib import Path

import pytest

from codebase_qa.chunking import chunk_file, _chunk_by_lines


def test_python_two_functions(tmp_path: Path) -> None:
    f = tmp_path / "sample.py"
    f.write_text("def foo():\n    return 1\n\ndef bar():\n    return 2\n")
    chunks = chunk_file(f)
    assert len(chunks) == 2
    texts = " ".join(c.text for c in chunks)
    assert "def foo" in texts
    assert "def bar" in texts


def test_python_class(tmp_path: Path) -> None:
    f = tmp_path / "module.py"
    f.write_text("class Foo:\n    def method(self):\n        pass\n")
    chunks = chunk_file(f)
    assert len(chunks) == 1
    assert "class Foo" in chunks[0].text


def test_python_decorated_function(tmp_path: Path) -> None:
    f = tmp_path / "views.py"
    f.write_text("@app.route('/')\ndef index():\n    return 'hello'\n")
    chunks = chunk_file(f)
    assert len(chunks) == 1
    assert "@app.route" in chunks[0].text


def test_python_line_numbers(tmp_path: Path) -> None:
    f = tmp_path / "lines.py"
    f.write_text("x = 1\n\ndef foo():\n    pass\n")
    chunks = chunk_file(f)
    assert any(c.start_line == 3 for c in chunks)


def test_empty_file_returns_no_chunks(tmp_path: Path) -> None:
    f = tmp_path / "empty.py"
    f.write_text("")
    assert chunk_file(f) == []


def test_fallback_unknown_extension(tmp_path: Path) -> None:
    f = tmp_path / "notes.txt"
    f.write_text("\n".join(f"line {i}" for i in range(1, 101)))
    chunks = chunk_file(f)
    assert len(chunks) > 1
    assert chunks[0].start_line == 1
    assert chunks[0].end_line <= 40


def test_fallback_chunks_overlap(tmp_path: Path) -> None:
    f = tmp_path / "data.txt"
    f.write_text("\n".join(f"L{i}" for i in range(50)))
    chunks = chunk_file(f)
    # Consecutive chunks must overlap: next start ≤ current end
    for a, b in zip(chunks, chunks[1:]):
        assert b.start_line <= a.end_line


def test_chunk_by_lines_single_window(tmp_path: Path) -> None:
    f = tmp_path / "short.txt"
    f.write_text("a\nb\nc")
    chunks = _chunk_by_lines(f, "a\nb\nc")
    assert len(chunks) == 1
    assert chunks[0].start_line == 1
    assert chunks[0].end_line == 3
