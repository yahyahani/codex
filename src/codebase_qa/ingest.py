from pathlib import Path

SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx",
    ".java", ".go", ".rb", ".rs", ".c", ".cpp", ".h", ".hpp",
    ".cs", ".php", ".swift", ".kt", ".scala",
    ".md", ".txt", ".yaml", ".yml", ".toml", ".json",
}

IGNORE_DIRS = {
    ".git", ".svn", ".hg",
    "node_modules", "__pycache__", ".venv", "venv", "env",
    "dist", "build", ".eggs", "*.egg-info",
    ".idea", ".vscode",
    "chroma_db",
}


def collect_files(root: Path) -> list[Path]:
    """Return all indexable source files under root, skipping ignored directories."""
    if not root.exists():
        raise FileNotFoundError(f"Path does not exist: {root}")
    if root.is_file():
        return [root] if root.suffix in SUPPORTED_EXTENSIONS else []

    files: list[Path] = []
    for path in sorted(root.rglob("*")):
        if _is_ignored(path, root):
            continue
        if path.is_file() and path.suffix in SUPPORTED_EXTENSIONS:
            files.append(path)
    return files


def _is_ignored(path: Path, root: Path) -> bool:
    """Return True if any component of path (relative to root) is in IGNORE_DIRS."""
    try:
        relative = path.relative_to(root)
    except ValueError:
        return False
    return any(part in IGNORE_DIRS for part in relative.parts)
