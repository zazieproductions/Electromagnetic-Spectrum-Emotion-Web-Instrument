# Roadmap

This is a working document. It is not a product plan. Items are separated by distance from the current architecture rather than by priority.

## Near-term

Realistic improvements that fit the existing React/Web Audio architecture.

- **Fix drone-off release.** Releasing Drone while latched voices are sounding should release those voices. The reconcile effect needs a guard for `!drone && latched.size > 0`.
- **Keyboard accessibility for knobs.** Make each knob focusable, arrow-key adjustable, and announce its percent value to screen readers.
- **Add a voice limit.** Prevent a pathological 60-voice drone from exhausting CPU by capping simultaneous voices and stealing the oldest.
- **Persist settings.** Save `master`, `reverb`, `delay`, `drive`, `glide`, and `arpRate` to `localStorage` without saving latched notes.
- **Documented keyboard row.** Add a small visible caption describing `A–L` / `Q–P` and the arrow-key window shift on mobile where the keyboard is not available.
- **Touch-drag experience tuning.** The 44px cell size is usable on touch, but vertical-drag knobs need a clearer target.

## Experimental

More ambitious but still plausible inside the existing module boundaries.

- **WebMIDI input.** Allow an external keyboard to trigger ribbon cells and a pitch wheel to drive theremin glide.
- **OSC input.** Receive band/note/velocity messages over WebSocket so a front-of-house rig or another app can drive the instrument.
- **AudioWorklet voice architecture.** Replace per-note `OscillatorNode` voices with a worklet synthesiser for CPU efficiency and tighter timing.
- **Shader-based visualiser.** Move the canvas aurora to WebGL for larger field sizes and post-processing glitch layers.
- **Spatial audio.** Use `PannerNode` to position band voices around the listener.
- **Recordable performance.** Add offline rendering or a `MediaRecorder` capture path for downloadable output.
- **Patch/preset system.** Allow users to save a collection of latched cells and settings as named instrument states.

## Research directions

These are conversations worth having, not committed features.

- **Non-pentatonic fields.** A mode where the consonant constraint is optional and the player can tune the tonal architecture.
- **Deterministic randomness.** Generative selection that is seeded per-session yet still sounds considered.
- **Hostile interface.** A "broken instrument" mode with intentionally unstable labels, jitter, or latency as a critique of smooth UI.
- **Perceptual tuning.** Detailed mapping between EM frequency and human hearing using a perceptual scale rather than MIDI.
- **Multi-player/networked performance.** Shared spectrum state with timing compensation.
- **Physical sensors.** Use accelerometer, gyroscope, or ambient light to modulate band selection.
- **Offline/self-contained distribution.** Package the instrument as a single-file or PWA artifact for galleries and archival displays.

## What is deliberately not on the roadmap

- A general-purpose synthesizer.
- A data visualisation of the real electromagnetic spectrum.
- A stateful social app with accounts.
- A mobile-first consumer experience.
- Automatic generative music composition.
