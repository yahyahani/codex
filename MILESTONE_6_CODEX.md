# Milestone 6 — Codex Dashboard

Doel: een modern, professioneel dashboard voor de codebase-qa tool, onder de
naam **Codex** — een visuele identiteit die past bij een precisie-tool voor
code-introspectie. Light en dark mode, eigen logo, geen generieke chat-UI.

## Naam & merk
- Productnaam: **Codex**
- Logo: een eenvoudig, geometrisch icoon — vierkant met afgeronde hoeken
  (`border-radius: 6px`), elektrisch blauwe achtergrond (`#0066FF`), met een
  wit `{ }`-symbool (monospace font, bold) erin. Maak dit als een inline SVG
  component (`Logo.jsx`), niet als los afbeeldingsbestand — zo blijft het
  scherp op elke schaal en makkelijk herbruikbaar (favicon, header, README).
- Gebruik dit logo ook als favicon: genereer een simpele SVG/PNG-favicon met
  hetzelfde ontwerp en vervang de standaard Vite-favicon in `index.html`.
  Zet de title-tag op "Codex — Codebase Q&A".

## Visuele identiteit

### Kleuren
**Dark mode (default):**
- Achtergrond pagina: `#0A0E14`
- Panelen/cards: `#111620`
- Subtiele rand: `#1C2330`
- Accent (electric blue): `#0066FF`, hover `#1A75FF`
- Primaire tekst: `#E8EBF0`
- Secundaire tekst: `#8B96A3`
- Tertiaire tekst/hints: `#5A6472`

**Light mode:**
- Achtergrond pagina: `#F5F7FA`
- Panelen/cards: `#FFFFFF`
- Subtiele rand: `#E2E6EC`
- Accent: zelfde electric blue `#0066FF`, hover `#0052CC`
- Primaire tekst: `#1A1F29`
- Secundaire tekst: `#5C6675`
- Tertiaire tekst/hints: `#8A92A0`

Implementeer via een `data-theme="dark"|"light"` attribuut op `<html>` +
Tailwind's `dark:` variant (class-based dark mode, niet media-query-based,
zodat de toggle direct werkt). Sla de voorkeur op in React state (NIET
localStorage — dat werkt niet in alle preview-omgevingen; gebruik in-memory
state met een sensible default op dark mode).

### Typografie
- Monospace (code, bestandspaden, regelnummers): `JetBrains Mono`, via
  Google Fonts
- UI/koppen: `Inter`, via Google Fonts
- Geen overdreven gewichtsvariatie — gebruik 400 (regular) en 500/600 (voor
  koppen en labels), niet meer dan 2-3 gewichten totaal

### Signature element — broncode-kaarten
Dit is het belangrijkste visuele onderdeel. Elke bron uit het antwoord wordt
een eigen kaart:
- Header van de kaart: bestandspad in monospace, in de accentkleur, met
  regelnummer-range ernaast (bijv. `calculator.py` · `4–38`)
- Body: de daadwerkelijke code-inhoud, monospace, met regelnummers in een
  smalle kolom aan de linkerkant (zoals een echte editor — gebruik hiervoor
  een lichte syntax-highlighting library als `prism.js` of `highlight.js`
  via CDN, geen eigen tokenizer bouwen)
- Subtiele linker accent-rand (`border-left: 2px solid accentkleur`) op elke
  kaart om 'm visueel te onderscheiden van gewone UI-panelen

### Layout
Twee-kolom layout:
- **Links (sidebar, ~320px breed)**: logo + naam boven, vraag-textarea,
  "Ask"-knop (accentkleur), mock-mode toggle, collection-naam input,
  daaronder een lijst met eerdere vragen (history) — elk klikbaar om
  terug te zien
- **Rechts (hoofdpaneel)**: bovenaan het gestreamde antwoord in een groot
  leesbaar paneel, daaronder de bron-kaarten in een verticale stack of
  2-koloms grid (afhankelijk van aantal bronnen)
- Rechtsboven in de hoofdpaneel-header: de light/dark mode toggle (zon/maan-
  icoon, gebruik een svg-icon-set als `lucide-react`, geen emoji)
- Empty state (nog geen vraag gesteld): gecentreerd in het hoofdpaneel, met
  het Codex-logo groot en gedimd, en een korte instructietekst

### Achtergrond-afwerking
Geen platte vlakke kleur alleen — voeg een subtiele diepte toe:
- Dark mode: een zeer zachte radiale gradient vanuit de linkerboven-hoek
  (accentkleur op ~4% opacity) over de `#0A0E14`-achtergrond, zodat het niet
  helemaal vlak aanvoelt maar ook niet "glow-effect"-achtig overdreven is
- Light mode: zelfde principe, maar accentkleur op ~3% opacity over de
  `#F5F7FA`-achtergrond
- Cards/panelen krijgen een zeer subtiele schaduw (alleen in light mode;
  in dark mode werkt een rand beter dan een schaduw)

### Motion
- Streaming tekst-animatie voor het antwoord (echte SSE-data, geen
  nep-typewriter)
- Bron-kaarten faden licht in zodra ze binnenkomen (`opacity` + kleine
  `translateY`, ~200ms, niet langer)
- Theme-toggle: een vloeiende kleurovergang (`transition: background-color
  200ms, color 200ms`) op de belangrijkste containers, geen abrupte flits
- Verder terughoudend — geen extra decoratieve animatie

## Technische opzet (ongewijzigd t.o.v. eerder plan)
React + Vite in `frontend/`, Tailwind voor styling (configureer de hierboven
genoemde kleuren als custom Tailwind-tokens in `tailwind.config.js` onder
`theme.extend.colors.codex`, zodat je `bg-codex-accent` etc. kan gebruiken
in plaats van losse hex-codes door de hele codebase).

```
frontend/
├── index.html                  # title "Codex — Codebase Q&A", favicon
├── package.json
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                 # theme state, layout
    ├── components/
    │   ├── Logo.jsx             # inline SVG, herbruikbaar
    │   ├── ThemeToggle.jsx
    │   ├── QueryInput.jsx
    │   ├── QueryHistory.jsx
    │   ├── AnswerPanel.jsx
    │   └── SourceCard.jsx       # met syntax highlighting
    └── styles/
        └── index.css            # Tailwind import + font-imports (Inter, JetBrains Mono)
```

### Backend
- CORS toevoegen aan FastAPI (dev: Vite op 5173 → API op 8000)
- Voor productie: `npm run build`, output kopiëren in de Docker-image,
  serveren via `StaticFiles` — één service in Docker, geen aparte container

### Docker
Multi-stage Dockerfile: node-stage bouwt de frontend, daarna kopiëren naar
de bestaande Python-image. `docker compose up` → alles op poort 8000.

## Werkwijze
1. Zet eerst Tailwind-config + kleurtokens + fonts op — dit is de basis
   waar alles op bouwt
2. `Logo.jsx` en `ThemeToggle.jsx` — klein en herbruikbaar, test theme-switch
   meteen werkend voordat je verder bouwt
3. Layout-skeleton (sidebar + hoofdpaneel), nog zonder data
4. `QueryInput` → koppelen aan `/ask` (niet-streaming eerst)
5. Upgrade naar `/ask/stream` voor `AnswerPanel`
6. `SourceCard` met syntax highlighting
7. `QueryHistory` (lokale state, geen backend-wijziging nodig)
8. Achtergrond-afwerking en motion als laatste polish-stap
9. Docker-integratie, README bijwerken met screenshot-plek
10. Testen in Docker, dan committen (apart: scaffold / componenten / styling-
    polish / Docker)

## README
Voeg een "Codex Dashboard" sectie toe: korte beschrijving, `docker compose up`,
`http://localhost:8000`, en een plek voor een screenshot
(`![Codex dashboard](docs/screenshot.png)`).
