# Debugging

## Audio context does not start

The browser blocks `AudioContext` until a user gesture. The Power On overlay is the intended gesture. If you open devtools and call `synth.ensureStarted()` from the console without a click, the context may remain suspended.

In the console:

```js
const { synth } = await import('/src/lib/synth.ts');
await synth.ensureStarted();
```

But this may still need a user gesture depending on browser. Use the Power On button in normal use.

## No sound on a cell press

Check the browser console for Web Audio errors. The most common cause in a dev session is a suspended context from changing tabs or a browser policy. Clicking Power On again calls `ensureStarted()`, which resumes a suspended context.

If a cell is already sounding, the synth ignores the duplicate:

```ts
if (this.voices.has(cell.key)) return;
```

This is intentional.

## Visualiser has no active bars

Before Power On, `synth.analyser` is undefined and the canvas draws an idle animation. After Power On, the visualiser reads `getByteFrequencyData`. If it still looks mostly idle, check that a note is actually sounding (the active cell should be displaced).

## Reconcile behaviour

Drone latch is reconciled in an effect. If latched cells appear but produce no sound:

1. Confirm `started` is `true`.
2. Confirm `drone` is `true`.
3. Confirm `mode` is `"ribbon"`.
4. Confirm `arp` is `false`.

If `arp` is true, sustained voices are silenced by design.

## Lint errors after a refactor

The project uses `typescript-eslint` with `react-hooks` rules. Run:

```bash
npm run lint
```

The `react-hooks/set-state-in-effect` rule can flag legitimate reconciliation effects. If you add a new effect that synchronises external audio state with React presentation, run lint and consider whether the state update belongs in a browser event instead.

## Browser smoke tests

Playwright stubs the dev server with `webServer`. If the test cannot reach `http://127.0.0.1:4173`, check that no other process owns that port.

```bash
npm run test:e2e
```

The tests are intentionally small: render boot chrome and Power On overlay removal.

## Screenshot capture

`npm run capture:screenshots` expects the dev server to be free on port `4175`. Override with:

```bash
CAPTURE_PORT=4180 npm run capture:screenshots
```

## Common timeouts

The screenshot script waits for Vite with up to 60 seconds. The first dev-server compile can exceed that on cold cache; rerun if the script fails after a fresh `npm ci`.
