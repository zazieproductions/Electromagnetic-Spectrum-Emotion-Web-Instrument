# Contributing

The Emotion Spectrum is an art-technology repository maintained by Zazie Productions. Contributions are welcome when they respect the instrument's conceptual design.

## What kind of contributions are useful

- Bugs in audio timing, pointer handling, state reconciliation, or visualiser rendering.
- Documentation corrections.
- Small accessibility improvements that do not flatten the instrument's visual identity.
- New electromagnetic-band data (with an accompanying conceptual rationale).
- Test coverage for data, state, and boot paths.
- Screenshot refreshes from the capture workflow.

## What is usually not wanted

- Stylistic rewrites that normalise the interface into a generic product UI.
- Converting the project into a general-purpose modular synthesizer.
- Adding large dependencies without first opening an issue.
- Adding randomness or generative behaviour that changes the instrument's deterministic identity without an explicit precedent.

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Run `npm ci`.
3. Make a focused change. One logical change per branch.
4. Run the verification suite:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
5. If changing interaction behaviour, run the browser smoke tests:
   ```bash
   npx playwright install chromium
   npm run test:e2e
   ```
6. Open a pull request. Describe what the change does to the **art and the audio**, not only the code.

## Documentation convention

- README is orientation only.
- ARCHITECTURE.md is the system-level explanation.
- `docs/technical/` is subsystem detail.
- `docs/design/` is interface and concept.
- `docs/development/` is setup and workflow.
- Inline comments should explain *why*, not re-state syntax.

Do not duplicate the same explanation in two places. If a change requires documentation, update the most specific document and leave README/ARCHITECTURE as links.

## Screenshots

Project screenshots are generated from the running app, not from image editing. To refresh them:

```bash
npm run capture:screenshots
```

In CI, the `Capture Screenshots` workflow can be dispatched from a branch and will commit the generated images back.

## License

The repository currently has no explicit license. New contributions are offered under the same terms as understood by the maintainer at the time of contribution; if you need a reference to copy, map, or deploy the work, open an issue before assuming any license.
