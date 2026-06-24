# Milestone 6 — Dashboard Frontend

Doel: een modern, professioneel dashboard voor de codebase-qa tool — geen
simpele chatbox, maar een interface die aanvoelt als een instrument voor
code-introspectie. De gebruiker stelt een vraag over een codebase en krijgt
een antwoord terug met exacte bronverwijzingen (bestand + regelnummers).

## Ontwerprichting (volg dit precies, niet een generieke dashboard-template)

**Kenmerk van het product**: dit gaat over precisie — exacte regelnummers,
echte broncode als bewijs, geen giswerk. Het ontwerp moet die precisie
uitstralen, niet een speelse chat-app-vibe.

### Visuele identiteit
- **Kleur**: donkere basis (near-black, bijv. `#0A0B0D`), GEEN puur zwart.
  Eén scherpe accentkleur voor interactie/focus — gebruik een signaal-kleur
  die "live data" oproept zonder cliché te zijn (vermijd het voor-de-hand-
  liggende acid-green-on-black dat overal voorkomt). Denk aan een
  warm amber/oranje (`#FF8A3D`-achtig) als accent tegen koel donkergrijs
  (`#13151A`, `#1C1F26`) voor panelen — warm-tegen-koel geeft meer karakter
  dan nog een neon-op-zwart dashboard.
- **Typografie**: een monospace font voor alles wat met code/bronnen te
  doen heeft (bijv. `JetBrains Mono` of `IBM Plex Mono` via Google Fonts/
  cdnjs) — dat is hier functioneel, niet decoratief, want regelnummers en
  bestandspaden horen in monospace. Voor UI-labels en koppen een geometrische
  sans (bijv. `Inter` of `Space Grotesk`) — strak, geen warme/ronde fonts.
- **Signature element**: de broncode-fragmenten worden niet als platte lijst
  getoond, maar als een soort "bewijsstukken" — een paneel per bron met
  bestandspad, regelnummers, en de daadwerkelijke code-inhoud in een
  mini-codeblock met regelnummering aan de zijkant (zoals een echte editor).
  Dit is het element dat dit dashboard onderscheidt van een generieke
  chat-UI: de bronnen zíjn de content, niet een voetnoot.
- **Layout**: geen los chatvenster. Denk aan een twee-kolom layout:
  links een vraag-input + geschiedenis van gestelde vragen (smal, sidebar-
  achtig), rechts het hoofdpaneel met het antwoord boven en de
  bronfragmenten daaronder in een grid of gestapelde kaarten.
- **Motion**: terughoudend. Een subtiele streaming-tekst-animatie voor het
  antwoord (karakters die binnenkomen, want dat IS hoe de backend het
  levert via SSE — geen nepanimatie, een echte weergave van live data).
  Bronkaarten mogen licht infaden zodra ze binnenkomen. Geen verder
  decoratieve motion.

### Wat NIET te doen
- Geen gradient-accentkleur-op-grote-getal hero (template-antwoord)
- Geen emoji's in de UI
- Geen overdreven veel iconen/illustraties — dit is een precisie-tool, niet
  een consumer-app
- Geen paarse/blauwe "AI-product" gradient-look

## Technische opzet

### Stack
React (functioneel met hooks), in `frontend/` als Vite-project — dit
rechtvaardigt een build-step omdat het er nu echt uitziet als een serieus
dashboard, niet een los script. Tailwind voor styling (utility classes,
custom kleuren via config voor de hierboven genoemde palette).

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── QueryInput.jsx
    │   ├── QueryHistory.jsx
    │   ├── AnswerPanel.jsx        # streamt het antwoord
    │   └── SourceCard.jsx          # bestandspad + regelnummers + code
    └── styles/
        └── index.css               # Tailwind import + font-imports
```

### Backend aanpassing
- CORS-headers toevoegen aan FastAPI zodat de Vite-dev-server (poort 5173)
  tijdens ontwikkeling de API (poort 8000) kan aanroepen
- Voor productie: frontend builden (`npm run build`) en de `dist/`-output
  serveren via FastAPI's `StaticFiles` — zo blijft er één service nodig in
  Docker

### Data-koppeling
- Gebruik `/ask/stream` (SSE) voor het live binnenkomende antwoord
- Toon de `sources`-events als losse `SourceCard`-componenten zodra ze
  binnenkomen
- Duidelijke states: idle / loading / streaming / error / mock-actief
  (als de backend in mock-modus draait, laat dat zichtbaar zien — bijv.
  een klein label "Demo mode — no API key required", geen verborgen gedrag)

### Docker
- Multi-stage Dockerfile-aanpassing: eerst frontend builden (`node` stage),
  dan de `dist/`-output kopiëren in de bestaande Python-image, geserveerd
  via `StaticFiles`
- Eén `docker compose up` moet zowel backend als frontend beschikbaar maken
  op poort 8000

## Werkwijze (belangrijk — volg dit proces)
1. Schrijf eerst kort het tokenplan uit (kleuren als hex, fonts, layout in
   ASCII) voordat je begint te coderen — check dat het niet op een generiek
   dashboard-template lijkt
2. Bouw component voor component, test elke stap visueel
3. Houd de bestaande backend-logica (qa.py, api.py) intact — alleen CORS en
   eventueel StaticFiles toevoegen, geen herstructurering
4. Test de volledige flow in Docker voordat je commit
5. Commit apart van de backend: één commit voor de frontend-scaffold, één
   voor de styling/componenten, één voor de Docker-integratie

## README
Voeg een "Dashboard" sectie toe met instructies (`docker compose up`, open
`http://localhost:8000`) en ruimte voor een screenshot.
