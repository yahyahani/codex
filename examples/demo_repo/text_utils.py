"""String manipulation utilities."""

import re


def word_count(text: str) -> int:
    """Return the number of whitespace-separated words in text."""
    return len(text.split())


def truncate(text: str, max_chars: int, suffix: str = "...") -> str:
    """Shorten text to max_chars, appending suffix when truncated."""
    if len(text) <= max_chars:
        return text
    return text[: max_chars - len(suffix)] + suffix


def slugify(text: str) -> str:
    """Convert a string to a lowercase URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


def indent(text: str, spaces: int = 4) -> str:
    """Prefix every line of text with the given number of spaces."""
    pad = " " * spaces
    return "\n".join(pad + line for line in text.splitlines())
