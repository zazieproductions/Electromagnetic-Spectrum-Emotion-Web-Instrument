# Deployment

The live version is deployed with GitHub Pages using Actions.

## URL

<https://zazieproductions.github.io/Electromagnetic-Spectrum-Emotion-Web-Instrument/>

## Workflow

[`.github/workflows/deploy-pages.yml`](../../.github/workflows/deploy-pages.yml)

- Triggers on push to `main` or manual `workflow_dispatch`.
- Builds with `npm run build`.
- Uploads `dist/` as a Pages artifact using `actions/upload-pages-artifact`.
- Deploys with `actions/deploy-pages`.

## Enabling Pages

GitHub Pages must be enabled by a repository maintainer before the workflow can deploy:

1. Open **Repository Settings → Pages → Build and deployment**.
2. Set **Source** to **GitHub Actions**.
3. Confirm that the repository has `actions: read` and `pages: write` (the workflow declares these itself).

The `actions/configure-pages@v5` step with `enablement: true` will attempt to enable the Pages site automatically when the runner token has admin permission. Tokens scoped to a non-admin integration (for example a build bot used to generate screenshots) may receive `Resource not accessible by integration`; in that case only a repository owner can enable Pages.

Once Pages is enabled, manual dispatch works from any branch:

```bash
gh workflow run deploy-pages.yml --ref <branch>
```

## Relative base

The Vite config sets `base: "./"`. This means:

- Local `dist/` works when served from the repository root.
- The deployed bundle works under `/Electromagnetic-Spectrum-Emotion-Web-Instrument/`.
- No absolute origin is baked into the build.

To verify after a local build:

```bash
npm run build
npm run preview
```

## Asset paths

- The favicon is referenced with `%BASE_URL%favicon.svg`, so Vite resolves it correctly for both local and sub-path deployment.
- README images are relative paths in `docs/images/` and are resolved by GitHub's markdown renderer in the repository, not by the deployed asset path.

## Verifying a deployment

1. Confirm the Pages workflow finished successfully.
2. Open the live URL.
3. Confirm the title, font styles, and canvas render.
4. Click Power On.
5. Check the browser console for 404s on `/assets/...`.

There is no client-side routing, so refresh always returns to the app root; there is no 404 path to configure.

## Preview environments

The Vite dev server is the primary preview. `npm run preview` binds to `0.0.0.0` so platform preview proxies can reach it.

## Environment variables

None are used.
