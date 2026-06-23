from pathlib import Path

import typer
from dotenv import load_dotenv

load_dotenv()

app = typer.Typer(help="Codebase Q&A — index a repo and ask questions about the code.")

_EMBED_BATCH = 64


@app.command()
def index(
    path: Path = typer.Argument(..., help="Path to the codebase to index"),
    collection: str = typer.Option("codebase", help="Name for the ChromaDB collection"),
) -> None:
    """Index a codebase: parse files, create embeddings, store in ChromaDB."""
    from codebase_qa.ingest import collect_files
    from codebase_qa.chunking import chunk_file
    from codebase_qa.embeddings import embed
    from codebase_qa.vectorstore import add_chunks

    files = collect_files(path)
    typer.echo(f"Found {len(files)} file(s).")

    all_chunks = []
    for f in files:
        all_chunks.extend(chunk_file(f))
    typer.echo(f"Created {len(all_chunks)} chunk(s).")

    for i in range(0, len(all_chunks), _EMBED_BATCH):
        batch = all_chunks[i : i + _EMBED_BATCH]
        embeddings = embed([c.text for c in batch])
        add_chunks(collection, batch, embeddings)
        typer.echo(
            f"  Stored chunks {i + 1}–{i + len(batch)} / {len(all_chunks)}"
        )

    typer.echo(f"Done. Collection '{collection}' is ready to query.")


@app.command()
def ask(
    question: str = typer.Argument(..., help="Question to ask about the codebase"),
    collection: str = typer.Option("codebase", help="ChromaDB collection to search"),
    top_k: int = typer.Option(5, help="Number of chunks to retrieve"),
) -> None:
    """Ask a question about an indexed codebase."""
    from codebase_qa.qa import answer

    sources = answer(question, collection_name=collection, top_k=top_k)

    if sources:
        seen: set[str] = set()
        typer.echo("\nSources:")
        for s in sources:
            ref = f"  {s['file']}:{s['start_line']}-{s['end_line']}"
            if ref not in seen:
                typer.echo(ref)
                seen.add(ref)


if __name__ == "__main__":
    app()
