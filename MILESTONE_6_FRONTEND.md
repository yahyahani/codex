# Milestone 6 — Web Frontend

Doel: een simpele chat-achtige web-UI die tegen de bestaande FastAPI-backend
praat (`/ask` en/of `/ask/stream`). Geen losse backend-wijzigingen nodig,
alleen een frontend die de bestaande endpoints aanroept.

## Aanpak
Houd het klein en gericht — dit is een aanvulling op het portfolio-project,
geen apart groot project. Eén pagina, geen routing, geen build-complexiteit
die niet nodig is.

## Wat moet er gebouwd worden

### Structuur
```
frontend/
├── index.html
├── style.css
└── app.js
```
Geen framework, geen build-step nodig — plain HTML/CSS/JS is hier prima en
houdt het project makkelijk te draaien voor wie het bekijkt. (Als je liever
React gebruikt mag dat ook, maar dan moet er een simpele Vite-setup bij komen
— alleen doen als dat geen extra gedoe geeft met Docker.)

### Functionaliteit
- Eén input-veld voor een vraag + verstuur-knop
- Antwoord wordt getoond, idealiter met streaming (gebruik `/ask/stream`
  via `EventSource` of `fetch` met een reader voor de SSE-events)
- Onder het antwoord: een lijst van bronnen (`file:start-end`), zoals de CLI
  dat ook al doet
- Duidelijke loading/error states: laat zien als de backend niet bereikbaar
  is, of als een mock-modus actief is (als de API dat al aangeeft)
- Simpele, opgeruimde styling — geen losse component-library nodig, gewoon
  nette CSS (denk: chat-bubble voor vraag/antwoord, monospace voor
  code-fragmenten in de bronnen)

### Backend aanpassing (minimaal)
- Voeg CORS-headers toe aan de FastAPI-app zodat de frontend (op een andere
  origin/poort) de API kan aanroepen tijdens lokale ontwikkeling
- Serveer de frontend eventueel direct vanuit FastAPI met `StaticFiles`
  (`app.mount("/", StaticFiles(directory="frontend", html=True))`) zodat er
  maar één service nodig is — geen apart frontend-process

### Docker
- Als de frontend via FastAPI's StaticFiles geserveerd wordt, hoeft er niets
  aan docker-compose te veranderen — alles draait al via de bestaande `app`
  service op de gemapte poort
- Test: `docker compose run --rm -p 8000:8000 app uvicorn codebase_qa.api:app --host 0.0.0.0`
  en open `http://localhost:8000` in de browser

### Tests
- Geen uitgebreide frontend-tests nodig voor dit portfolio-project — focus op
  een paar backend-tests die bevestigen dat de StaticFiles-mount en CORS
  correct werken

### README
- Voeg een sectie "Web UI" toe met een korte instructie hoe je de server
  start en de UI opent, plus een screenshot-plek (`![Web UI](docs/screenshot.png)`)
  die je later zelf invult

## Volgorde
1. Backend: CORS + StaticFiles mount
2. `frontend/index.html` + `style.css` (basis layout, geen logica)
3. `app.js`: fetch naar `/ask` (niet-streaming eerst, simpeler)
4. Als dat werkt: upgrade naar `/ask/stream` met live tekst
5. README bijwerken
6. Testen in Docker, daarna committen
