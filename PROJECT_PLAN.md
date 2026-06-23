# Codebase Q&A Tool — Projectplan

Een CLI-tool die een codebase (lokaal of GitHub-repo) indexeert en je vragen
laat stellen over de code, met antwoorden onderbouwd door echte code-fragmenten
(RAG: Retrieval-Augmented Generation).

## Doel van dit project
Laten zien dat je begrijpt: code-parsing, embeddings, vector search, en hoe je
een LLM betrouwbaar laat antwoorden op basis van bronmateriaal in plaats van
giswerk. Dit is een herkenbaar en serieus portfolio-project.

---

## Architectuur (5 stappen)

```
[Repo] --> [Chunking] --> [Embedding] --> [Vector Store] --> [Retrieval] --> [LLM antwoord]
```

1. **Ingestion** — repo inlezen (lokaal pad of git clone), bestanden filteren
   (geen node_modules, .git, binaries, etc.)
2. **Chunking** — code opdelen in logische stukken (per functie/klasse, niet
   blind op regelaantal knippen) — gebruik `tree-sitter` voor echte syntax-aware
   chunks
3. **Embedding** — elke chunk omzetten naar een vector via een embedding-model
4. **Vector store** — vectors + metadata (bestandsnaam, regelnummers) opslaan,
   bijv. in ChromaDB (lokaal, geen server nodig om te starten)
5. **Retrieval + Generation** — bij een vraag: top-k relevante chunks ophalen,
   samen met de vraag naar Claude API sturen, antwoord tonen mét bronverwijzing
   (welk bestand/regel)

---

## Tech stack

| Onderdeel        | Keuze                          | Waarom |
|-------------------|----------------------------------|--------|
| Taal              | Python 3.11+                    | Beste tooling voor RAG/embeddings |
| Code parsing      | `tree-sitter`                   | Syntax-aware chunking, niet zomaar knippen |
| Embeddings        | OpenAI `text-embedding-3-small` of lokaal `sentence-transformers` | Snel starten, later evt. lokaal voor privacy |
| Vector store      | ChromaDB                        | Lokaal, zero-config, makkelijk te demonstreren |
| LLM (antwoorden)  | Claude API (Anthropic)          | Sterk in code-redenering |
| CLI               | `Typer`                         | Schone, moderne CLI met weinig boilerplate |
| Config/secrets    | `.env` + `python-dotenv`        | API keys niet in code |

---

## Repo-structuur

```
codebase-qa/
├── README.md
├── pyproject.toml
├── .env.example
├── .gitignore
├── src/
│   └── codebase_qa/
│       ├── __init__.py
│       ├── cli.py            # Typer entrypoint: index / ask commands
│       ├── ingest.py          # repo inlezen + bestandsfilter
│       ├── chunking.py        # tree-sitter based code splitting
│       ├── embeddings.py      # tekst -> vector
│       ├── vectorstore.py     # ChromaDB wrapper (add/query)
│       └── qa.py              # retrieval + prompt naar Claude + antwoord
├── tests/
│   ├── test_chunking.py
│   ├── test_ingest.py
│   └── test_vectorstore.py
└── examples/
    └── demo_repo/              # klein voorbeeldrepo om mee te testen
```

---

## Taken in volgorde (milestones)

### Milestone 1 — Skeleton & ingestion
- [ ] `pyproject.toml` opzetten, dependencies (`typer`, `chromadb`,
      `tree-sitter`, `anthropic`, `python-dotenv`)
- [ ] `cli.py`: lege `index` en `ask` commands die werken (nog zonder logica)
- [ ] `ingest.py`: gegeven een pad, lijst van relevante bestanden teruggeven
      (filter op extensie + ignore-lijst)

### Milestone 2 — Chunking
- [ ] `chunking.py`: per bestand functies/classes uitsplitsen met tree-sitter
      (begin met 1 taal, bijv. Python, breid later uit)
- [ ] Fallback: als tree-sitter een taal niet kent, knip op vaste regelgrootte
      met overlap

### Milestone 3 — Embeddings + vector store
- [ ] `embeddings.py`: functie die een lijst strings omzet naar vectors
- [ ] `vectorstore.py`: ChromaDB collectie aanmaken, chunks + metadata
      toevoegen, similarity search functie
- [ ] `index` command werkend maken: repo -> chunks -> embeddings -> opslaan

### Milestone 4 — Retrieval + LLM-antwoord
- [ ] `qa.py`: vraag -> top-k chunks ophalen -> prompt samenstellen -> Claude
      API aanroepen -> antwoord + bronbestanden tonen
- [ ] `ask` command werkend maken

### Milestone 5 — Polish voor portfolio
- [ ] Goede README met GIF/screenshot van een sessie
- [ ] `.env.example` en duidelijke installatie-instructies
- [ ] Paar tests die de kernfuncties dekken
- [ ] Voorbeeld-repo in `examples/` zodat reviewers het meteen kunnen proberen
- [ ] (optioneel, indrukwekkend) klein FastAPI-endpoint erbovenop, of een
      simpele web-UI

---

## Hoe te starten met Claude Code

1. Maak een map, bijv. `codebase-qa`, en open die in Claude Code
2. Zet dit bestand erin als `PROJECT_PLAN.md`
3. Geef Claude Code de opdracht: "Lees PROJECT_PLAN.md en zet Milestone 1 op"
4. Werk milestone voor milestone af, test telkens voordat je verder gaat
5. Commit per afgeronde taak — dat geeft een nette, leesbare git-historie
   (goed voor je portfolio: reviewers zien hoe je het hebt opgebouwd)

## Git-tip
Begin meteen met `git init`, een eerste commit met alleen dit plan en een
`.gitignore`, en commit daarna per milestone/taak. Een rommelige "initial
commit" met alles erin in één keer staat minder professioneel.
