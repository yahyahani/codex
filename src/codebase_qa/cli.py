from pathlib import Path

import typer
from dotenv import load_dotenv

load_dotenv()

app = typer.Typer(help="Codebase Q&A — index a repo and ask questions about the code.")


@app.command()
def index(
    path: Path = typer.Argument(..., help="Path to the codebase to index"),
    collection: str = typer.Option("codebase", help="Name for the ChromaDB collection"),
) -> None:
    """Index a codebase: parse files, create embeddings, store in ChromaDB."""
    typer.echo(f"Indexing {path} into collection '{collection}' … (not yet implemented)")


@app.command()
def ask(
    question: str = typer.Argument(..., help="Question to ask about the codebase"),
    collection: str = typer.Option("codebase", help="ChromaDB collection to search"),
    top_k: int = typer.Option(5, help="Number of chunks to retrieve"),
) -> None:
    """Ask a question about an indexed codebase."""
    typer.echo(f"Question: {question!r} (not yet implemented)")


if __name__ == "__main__":
    app()
