from pathlib import Path

import pytest

from codebase_qa.ingest import collect_files, SUPPORTED_EXTENSIONS


def test_collect_files_returns_only_supported_extensions(tmp_path: Path) -> None:
    (tmp_path / "main.py").write_text("print('hello')")
    (tmp_path / "README.md").write_text("# readme")
    (tmp_path / "image.png").write_bytes(b"")

    result = collect_files(tmp_path)
    suffixes = {f.suffix for f in result}

    assert ".png" not in suffixes
    assert ".py" in suffixes
    assert ".md" in suffixes


def test_collect_files_ignores_node_modules(tmp_path: Path) -> None:
    node_modules = tmp_path / "node_modules"
    node_modules.mkdir()
    (node_modules / "index.js").write_text("module.exports = {}")
    (tmp_path / "app.js").write_text("console.log('hi')")

    result = collect_files(tmp_path)
    paths = [f.relative_to(tmp_path) for f in result]

    assert not any("node_modules" in str(p) for p in paths)
    assert Path("app.js") in paths


def test_collect_files_ignores_git_dir(tmp_path: Path) -> None:
    git_dir = tmp_path / ".git"
    git_dir.mkdir()
    (git_dir / "config").write_text("[core]")
    (tmp_path / "script.py").write_text("pass")

    result = collect_files(tmp_path)
    paths = [f.relative_to(tmp_path) for f in result]

    assert not any(".git" in str(p) for p in paths)


def test_collect_files_single_file(tmp_path: Path) -> None:
    f = tmp_path / "module.py"
    f.write_text("x = 1")
    assert collect_files(f) == [f]


def test_collect_files_unsupported_single_file(tmp_path: Path) -> None:
    f = tmp_path / "photo.jpg"
    f.write_bytes(b"")
    assert collect_files(f) == []


def test_collect_files_nonexistent_path(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        collect_files(tmp_path / "does_not_exist")
