# Rendering System

Source: [`src/components/Visualizer.tsx`](../../src/components/Visualizer.tsx), [`src/components/Ribbon.tsx`](../../src/components/Ribbon.tsx)

The project has two distinct render paths:

1. **React DOM** for interface, ribbon, controls, and readout.
2. **Canvas 2D** for the realtime audio visualiser.

They are not unified. The canvas is intentionally outside the React lifecycle.

## Canvas visualiser

`Visualizer` mounts a `<canvas>` with a RAF loop. It owns three buffers:

```ts
const freqData = new Uint8Array(1024);
const timeData = new Uint8Array(2048);
```

These are allocated once at mount and reused each frame. The loop reads:

```ts
synth.analyser.getByteFrequencyData(freqData);
synth.analyser.getByteTimeDomainData(timeData);
```

If `synth.analyser` is undefined (Power On has not happened), it draws a small idle sine and an idle bar amplitude instead.

### Aurora

- 96 bars.
- Each bar reads a frequency-bin index (`Math.floor(i / 96 * 220)`).
- Bars are mirrored around the horizontal centre.
- Bar height scales with `(0.5 + intensity * 0.9)`.
- Idle bar height uses a slow sine phase so the instrument still looks alive before audio starts.

### Oscilloscope

- A single 2px stroke across the full time-domain buffer.
- `shadowBlur = 18` and a matching shadow colour.
- A secondary 1px echo line at `20%` vertical scale, with white at `0.12` alpha.

### Device pixel ratio

`resize()` sets canvas dimensions to `rect * min(devicePixelRatio, 2)` and uses `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`. This keeps the canvas crisp on retina displays without allowing unbounded memory use at enormous DPR values.

## React DOM ribbon

The ribbon is rendered as ordinary buttons inside a horizontally scrollable flex container. Generation follows the data model:

```tsx
BANDS.map(band =>
  band.emotions.map(emotion => <button data-cellkey={cell.key} ...>)
)
```

Each cell is keyed by `band.id:emotion.name`, the same string used by the synth's voice `Map`.

Cell state has three visual forms:

| State | Background | Border | Shadow | Transform |
| --- | --- | --- | --- | --- |
| Idle | faint white gradient | white 0.07 | none | none |
| Latched | band colour `88 → 22` | band colour | band glow | none |
| Active | band colour `→ 66` | band colour | band glow + white inset | `translateY(-4px) scale(1.02)` |

Active is visually distinct from latched, so it is possible to tell a *currently sounding through the pointer* cell from a *held drone* cell.

## React update policy

The instrument deliberately avoids storing voice audio state in React. `activeKeys` is a Set of cell keys that is updated on note-on/off and arpeggiator ticks. `currentCell` is a single value used by the readout.

Because the ribbon has twelve bands × five emotions = sixty cells, complete re-renders on pointer drag are cheap. A virtualised ribbon would be over-engineering at this count.

## What would change the architecture

- **Hundreds of cells:** migrate the ribbon to a canvas renderer or a virtual list.
- **Persistent visual state:** move the visualiser into a shared frame bus instead of direct `synth` access.
- **Offline/external visual export:** add a `canvas.toBlob` path and expose it from the controller.
