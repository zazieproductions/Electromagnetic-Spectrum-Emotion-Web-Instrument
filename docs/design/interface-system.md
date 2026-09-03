# Interface System

Source: [`src/App.tsx`](../../src/App.tsx) and `src/components/*`

## Hierarchy

The interface has five visible tiers:

1. **Atmosphere** — fixed background, layered radial glows, drifting grain grid.
2. **Header** — project identity, conceptual subtitle, mode buttons.
3. **Readout** — realtime canvas plus the current band/emotion/frequency telemetry.
4. **Ribbon** — the 60-cell playable spectrum.
5. **Control deck** — mixing, space, drive, timing, and panic controls.

The start overlay is a sixth temporary tier that sits above all of them until the audio gate is unlocked.

## Layout

The app is a column with horizontal padding that increases from `px-6` (mobile) to `md:px-10`. The readout is 210px tall; the ribbon cells are 172px tall inside a horizontally scrollable band area; the control deck is a flexible card.

The ribbon is the only horizontally scrollable area. On a 1440px viewport, roughly the first 1.5 bands are visible; the rest require horizontal scrolling. This means the instrument's "full spectrum" is not all visible at once, which is part of the piece's information design: you encounter it in order.

## Typography

| Role | Face | Weight | Notes |
| --- | --- | --- | --- |
| Display / headers / band names | Unbounded | 400/600/800 | wide, slightly retro-terminal; used for emotion labels on cells |
| Mono / labels / telemetry | JetBrains Mono | 400/500/700 | readouts, control names, keyboard hints |
| Large emotion readout | Fraunces | 400 | soft, literary contrast to the mono chrome |

## Borders and surfaces

- Panel borders are `1px solid rgba(255,255,255,0.10)` or lower.
- Panels use two-layer gradients:
  - `linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))` for the control deck.
  - `linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.35))` for the readout.
- Band cells use RGB-alpha colour gradients generated from `band.color`.

## Colour

The base is near-black `#05040a` with lavender-white text `#eae6ff`.

The active accent (`currentCell.band.color`) drives:

- Header logo glow and title shadow.
- Readout border/box-shadow and the large emotion text.
- Visualiser aurora/waveform colour.
- Active ribbon cell border, background, shadant.
- Control deck knob glow and toggle state.

The default accent when no note is sounding is `#8a7bff`.

## State colours

| State | Behaviour |
| --- | --- |
| Idle cell | faint white gradient, low-contrast border |
| Latched | band colour at high alpha, with band glow |
| Active | full band colour, raised transform |
| Control toggle on | `accent + 22` background, accent border/text |
| Control toggle off | `rgba(255,255,255,0.03)` background, white/50 text |
| Panic | neutral, low emphasis, lives at the edge of the deck |

## Motion

- Active cell: `transform: translateY(-4px) scale(1.02)` over 75ms.
- Toggle/mode buttons: no motion, just colour state.
- Knobs: no animation; they behave like hardware.
- Background grain: 12s linear infinite alternate translate.
- Canvas: continuous RAF animation, independent of React.

## Responsive behaviour

- Header, readout, ribbon, and control deck stack vertically.
- Ribbon can scroll horizontally on mobile.
- Frequency readout hides under 640px.
- Cell width shrinks from 52px to 44px below 768px.
- The start overlay is centered and scales with the viewport.

## Accessibility notes

- Ribbon cells are `<button>`s and have scriptable keyboard equivalents.
- Control knobs are currently divs with pointer handlers; they are not keyboard accessible. This is a documented interface debt.
- Active cell colour is reinforced by vertical displacement and the keyboard-key badge.
- The start overlay is the primary visual affordance for the browser audio gate.
