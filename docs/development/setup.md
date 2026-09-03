# Setup

## Requirements

- Node.js 20+
- npm 10+
- A browser with Web Audio API, Pointer Events, and Canvas 2D.

No environment variables are required. There is no `.env` file and there is no secret configuration. The Vite config uses a relative base for portability.

## Install

```bash
git clone https://github.com/zazieproductions/Electromagnetic-Spectrum-Emotion-Web-Instrument.git
cd Electromagnetic-Spectrum-Emotion-Web-Instrument
npm ci
```

`npm ci` is preferred over `npm install` because `package-lock.json` is the source of truth.

## Develop

```bash
npm run dev
```

The default dev URL is `http://localhost:5173`.

If a different port is needed:

```bash
npm run dev -- --port 5174
```

## Typecheck, lint, unit tests

```bash
npm run typecheck
npm run lint
npm run test
```

## Browser tests

Playwright requires a browser binary:

```bash
npx playwright install chromium
npm run test:e2e
```

In CI the browser install includes system dependencies:

```bash
npx playwright install --with-deps chromium
```

## Build and preview

```bash
npm run build
npm run preview
```

`preview` binds to `0.0.0.0` so the built site is reachable from the platform preview host.

## Screenshot capture

```bash
npm run capture:screenshots
```

This boots a dev server itself, so no separate server is needed. It writes:

- `docs/images/project-preview.png`
- `docs/images/project-active.png`
- `docs/images/project-detail.png`
- `docs/images/github-social-preview.png`

## Fonts

The interface loads Google Fonts via `src/index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;800&family=JetBrains+Mono:wght@400;500;700&family=Fraunces:opsz,wght@9..144,400;9..144,500&display=swap");
```

This is the only runtime network resource other than the application itself. The app is not a service worker.
