# Changelog

All notable changes to The Emotion Spectrum are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/) as a convention, with a small-studio level of ceremony.

## [1.0.0] - 2026-09-03

### Added

- Full documentation system: README, ARCHITECTURE, technical, design, development, and creative-system documents.
- GitHub Pages deployment workflow with relative Vite base.
- CI workflow covering typecheck, lint, unit tests, production build, and Chromium smoke tests.
- Playwright smoke tests for the boot path.
- Vitest unit tests for the spectrum data model and MIDI mapping.
- Screenshot capture workflow and `scripts/capture-screenshots.mjs`.
- Repository social preview generator (`docs/images/github-social-preview.png`).
- Favicon asset (`public/favicon.svg`).

### Changed

- Refactored the single 724-line `App.tsx` into a controller hook and presentational components.
- Extracted `ModeButton`, `Toggle`, `PanicButton`, `StartOverlay`, `Background`, `Header`, `Readout`, `Ribbon`, and `ControlDeck`.
- Cleaned the root `index.html`; removed injected Arena recording/telemetry/element-picker scripts and the `.vite-source-tags.js` plugin.
- Removed unused `framer-motion` and `react-router-dom` dependencies; `npm audit` is now clean.
- Updated package metadata to the project name, author, repository, keywords, and engagement scripts.
- Repositioned the repository as a public, documented creative-technology archive.

### Fixed

- ESLint: replaced `@ts-ignore` with a clean Vite config without the optional source-tag plugin.
- ESLint: removed the synchronous `setState` in the mode-change effect by moving mode switching behind `selectMode`.
- The start overlay no longer retains injected inline tracking scripts.

## Before 1.0.0

The repository existed as an unnamed Vite/React template with the working instrument. All substantive behaviour (bands, synthesizer, visualiser, interaction) was already present; the 1.0.0 release adds the archival, deployment, and testing layer around it.
