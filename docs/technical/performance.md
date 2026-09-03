# Performance

This document describes the current performance model and known hot spots. It is not a benchmark report; it is an engineering description of how the piece behaves in practice.

## Budget

| Layer | Work per frame / event | Control |
| --- | --- | --- |
| Canvas | 96 mirrored bars + 2048 point line | RAF loop, single buffer reuse |
| Audio | up to 60 voices in the worst case | voice `Map` prevents duplicates |
| React | state change on pointer/key/arp events | small controlled state sets |
| Ribbon | sixty DOM buttons | not virtualised |

## The RAF loop

`Visualizer.tsx` allocates `freqData` and `timeData` once on mount. `resize()` reallocates the canvas backing store only on browser resize. DPR is capped at 2.

The biggest per-frame cost is reading 2048 time-domain samples and drawing a 2048-point path. This is the reason for the secondary echo line to sample every other point (`timeData[i]` with `i += 2`).

## Audio graph hot spots

- **Convolver** uses a 3.2-second stereo impulse (roughly 282k samples per channel at 44.1kHz). This is generated once when the context starts, so the audible cost is fixed.
- **Oscillators** are created per note. At 60 sustained voices, the browser's scheduler will start to struggle; the natural count is well below that.
- **Waveshaper curve** is `1024` samples and regenerated only on Drive changes.
- **Feedback delay** is a simple single-tap loop with a lowpass. It is intentionally cheap.

## React render cost

The ribbon is 60 cells. When `activeKeys` or `latched` changes, React re-renders `Ribbon`. Sixty button reconciliations are negligible. Pointer drags can produce many `activeKeys` updates per second, but the number is still small compared to typical table rows or charts.

## Scheduling choices

- **Arpeggiator:** `setInterval` at 90–450ms. The controller clears all pending highlight timeouts when the effect unmounts or changes, preventing stale UI updates.
- **Glide:** `setTargetAtTime` with a time constant from the Glide setting, clamped to 5ms.
- **Envelope:** exponential ramps. These are robust against clicks because the gain never jumps to zero at the moment of release.

## What is not covered

- **Frame timing:** no FPS meter or frame-drop counter.
- **CPU profiling:** no timeline instrumentation for the RAF loop.
- **Mobile power:** no battery-awareness logic.
- **Memory accounting:** no voice-limit protection above the natural `Map`-based duplicate suppression.
