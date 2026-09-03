# Interaction Model

Source: [`src/hooks/useInstrumentController.ts`](../../src/hooks/useInstrumentController.ts)

## The core gesture: traverse, don't select

The instrument's most important interaction is not "click one thing". It is **moving across the spectrum**. Both modes encode this differently:

- Ribbon: discrete cells triggered by press/drag.
- Theremin: a single continuous voice retuned by horizontal movement.

There is no dropdown and no list. The only ordering navigation is the spectrum itself, plus the keyboard window shifter.

## Ribbon mode

### Press & drag

Pointer down on a cell starts the voice. Pointer move releases the previous cell and starts the next one. Pointer up releases the current cell.

This makes the ribbon feel like a string instrument: you can perform a slide with one hand while the other controls knobs.

### Drone latch

When Drone is on, a pointer press toggles a cell in the latched set instead of starting a transient note. This is a **performance hold**, not a "select multiple items" pattern.

The distinction matters: clicking a currently latched cell unlatches it, so the ribbon behaves like a toggle bank rather than a playlist.

### Arpeggiator

Latched cells form the sequence set. The arpeggiator picks one key per step, cyclically, starting from the most recent first selected order in `latchedRef`. It is intentionally simple: no probability, no rhythmic variation, no pattern memory.

### Keyboard row

`KEY_ROW` maps the home row to the current 20-cell window. Arrow keys shift the window by five. The keyboard is a secondary performance path for players who do not want to use a mouse on the ribbon.

## Theremin mode

Theremin mode replaces discrete notes with one voice:

1. pointer down starts the voice;
2. horizontal pointer movement retunes all oscillators;
3. vertical movement has no effect on pitch.

The Glide knob controls how quickly the pitch catches up. At low values the instrument is percussive; at high values it becomes a smear. The theremin does not use the drone or arp.

## Knobs

Knobs are vertical-drag controls. Dragging up increases value; dragging down decreases. Double-click resets the knob to 50%.

The rotary indicator moves from `-135°` to `+135°`. The knob reads like hardware, not like a `<input type="range">`.

Knob values are stored in `SynthSettings` in the controller and pushed to `synth.updateSettings` via effect. There is no debounce; the audio engine smooths with short time constants.

## Panic

Panic is intentionally outside the control metaphor. It silently stops all voices and clears the performance state. It does not reset the audio context, and it does not change the mode or settings.

## Temporal behaviour

- Voices are designed with long release tails. The instrument invites trailing sound after the hand leaves the ribbon.
- Drone voices persist until unlatched or Panic.
- Arp notes are short plucks.
- Theremin tails are long because the release uses the current band's release value.

## User agency

The player has three forms of agency:

1. **Choice of notes:** which cells to press/hold/latch.
2. **Choice of palette:** which band's timbre to inhabit.
3. **Choice of control path:** pointer versus keyboard, held versus latched versus sequenced.

The instrument does not have a randomness slider. It is a deterministic interface where the player's choices produce the music.

## Single-session constraint

The interface has no undo, no save, and no preset recall. A run is a single gesture-history. If you want to preserve it, you record the audio with external software. This is not an oversight; it is the behaviour of a real instrument.
