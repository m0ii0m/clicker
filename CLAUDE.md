# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Pixel City" — an idle/clicker city-builder. Three tiers: Vue 3 + Vite frontend (served by nginx), Flask backend, Redis storage. Code comments, UI strings and commit-adjacent docs are in French; keep that convention.

Note: `README.md` is stale — it describes a Minikube/`k8s/` deployment and `.github/workflows/main.yml`, neither of which exist anymore. The actual setup is Docker Compose locally and `.github/workflows/ci.yml` in CI.

## Commands

Full stack (frontend on http://localhost:8080, backend on :5000):
```bash
docker-compose up -d --build
docker-compose down
```

Backend tests need a **real Redis** on `REDIS_HOST` (default `localhost:6379`) — nothing is mocked, and `redis_service` connects at import time:
```bash
docker run -d -p 6379:6379 redis:alpine   # if no Redis running
cd backend && pip install -r requirements.txt
pytest                                     # all tests
pytest tests/test_app.py::test_save_and_load   # single test
```

Frontend:
```bash
cd frontend && npm install
npm run dev      # Vite dev server
npm run build
```
There is no lint setup and no frontend tests. `vite.config.js` has no `/api` proxy, so under `npm run dev` API calls fail unless you add one; `/api/` is only proxied to `backend:5000` by `frontend/nginx.conf` inside the Docker image.

## Architecture

**Game logic lives entirely in the frontend.** The backend is a dumb per-user JSON store: `GET /api/state`, `POST /api/save`, `DELETE /api/reset`, all keyed by the `X-User-ID` header and stored in Redis as `game:{user_id}` with a 30-day TTL (`backend/config.py`). The backend only checks that the payload is a JSON object. On save it stamps `last_saved` (server time); on load it strips it and returns `offline_seconds`, which the client turns into offline production (`OFFLINE_CONFIG`).

Backend layout: `app.py` (`create_app` factory, used by tests) → `routes/game.py` blueprint → `services/redis_service.py` singleton.

Frontend (`frontend/src`):
- `config/upgrades.js`, `config/bonuses.js`, `config/gameConfig.js` — data-driven game balance. Upgrades are `type: 'passive'` (`rateBonus`, per-second growth) or `type: 'click'` (`clickBonus`). Bonuses are one-time purchases whose `type` (`combo_max`, `combo_decay`, `combo_growth`, `click_multiplier`, `zone_multiplier` + `target`) is interpreted in `useGameState.js` (and `zone_multiplier` also in `useCityVisuals.js`). Adding a new bonus `type` requires adding its handling there.
- `composables/useGameState.js` — the core: reactive state, computed click power / growth rate / combo, purchase actions, and the timers (production tick based on real elapsed time, 100ms combo decay, periodic autosave). Saving rules: nothing is saved until the first `loadGame()` succeeds (`isLoaded`), all saves and the reset go through a serialized promise queue (`saveQueue`) so they can't land out of order, clicks use a debounced save, purchases save immediately, and a `keepalive` save is sent when the tab is hidden. Timings live in `SAVE_CONFIG` (`config/gameConfig.js`).
- `composables/useApi.js` — fetch wrapper; generates and persists the user ID in `localStorage` (`pixel_city_user_id`).
- `composables/useSaveManager.js` — file export/import, base64-encoded and signed with a simple hash salted by `VITE_SECRET_SALT` (baked in at build time via Docker build arg; see `.env.example`).
- `composables/useCityVisuals.js` — maps upgrade counts to sprites for `IsoScene.vue` via `SPRITE_MAP` (paths under `public/assets/`), capped at `VISUAL_CONFIG.MAX_SPRITES_PER_ZONE` per zone. New passive upgrades need a sprite entry here to appear in the scene.
- `App.vue` wires the composables to `GamePanel`, `BonusPanel`, `IsoScene`, `FooterActions`.

Save-format quirks: the field for population is named `trombones` (legacy from a paperclip clicker). Server saves and file exports contain `trombones`, `upgrades`, `bonuses`; the production rate is always derived, never trusted from a save. `trombones` may be fractional (real-time production tick); the UI floors it for display.

## CI/CD

`.github/workflows/ci.yml` on push to `main`: runs backend pytest against a Redis service, then builds and pushes `clicker-backend` / `clicker-frontend` images to Docker Hub (tags `latest` and the commit SHA). Requires secrets `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `VITE_SECRET_SALT`. There is no deploy step in the workflow.
