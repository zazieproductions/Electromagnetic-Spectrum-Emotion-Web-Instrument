# Security

The Emotion Spectrum is a small, client-only browser instrument. It does not process personal data, send analytics, write to a server, or host user-generated content.

## Scope

For security purposes the relevant scope is:

- the static deployed bundle,
- the Vite dev/build toolchain,
- the GitHub Actions workflows in this repository,
- and the browser APIs the document uses (`AudioContext`, Canvas, Pointer Events).

The repo does not contain server code, auth, or a database. Many standard "enterprise security" expectations simply do not apply.

## Reporting a vulnerability

If you find a vulnerability in the toolchain, a CI workflow, or the deployed page, open a private advisory via the GitHub repo and describe:

1. What you observed.
2. The browser version and OS.
3. Whether the issue reproduces on the live page or only in dev tools.

For dependency issues, check `npm audit` and the advisories before opening a report.

## Known dependencies

The project has a small dependency surface and `npm audit` currently reports no known vulnerabilities for the installed set.

Runtime dependencies:

- React
- Vite (dev)
- Tailwind CSS
- Lucide icons

Dev dependencies include TypeScript, ESLint, Vitest, and Playwright.

## Deployed bundle notes

- No secrets are embedded in the bundle.
- The GitHub Pages workflow uses `actions/deploy-pages` with `contents: read`, `pages: write`, and `id-token: write`. It has no repository write permission.
- The screenshot workflow uses `contents: write` because it commits generated images back to the branch. It is manually dispatched only.
- The relative Vite base avoids baking a specific hostname into the build.

## Privacy

The instrument uses no tracking scripts and sends no telemetry. User-provided input stays in the browser. Audio is never uploaded.
