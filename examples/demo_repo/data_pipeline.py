"""Lightweight data pipeline helpers for loading, filtering, and saving records."""

import json
from pathlib import Path


def load_json(path: str | Path) -> list[dict] | dict:
    """Load and return the contents of a JSON file."""
    return json.loads(Path(path).read_text())


def filter_records(records: list[dict], key: str, value) -> list[dict]:
    """Return only the records where record[key] == value."""
    return [r for r in records if r.get(key) == value]


def group_by(records: list[dict], key: str) -> dict[str, list[dict]]:
    """Group records into a dict keyed by the value of record[key]."""
    groups: dict[str, list[dict]] = {}
    for record in records:
        group_key = str(record.get(key, ""))
        groups.setdefault(group_key, []).append(record)
    return groups


def save_json(data, path: str | Path, indent: int = 2) -> None:
    """Serialise data to a JSON file, creating parent directories as needed."""
    dest = Path(path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(data, indent=indent))
