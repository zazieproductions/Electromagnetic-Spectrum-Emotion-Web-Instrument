# Visual Language

This document describes how the interface looks and why it looks that way.

## The reference

The interface is proportioned like a **laboratory instrument that has been recovered from an abandoned research facility and patched together with a browser**.

Visual elements are meant to read as instrumentation rather than as a consumer web UI:

- mono telemetry labels
- RGB alpha band colours treated as signal values
- vertical emotion labels like cartridge labels
- a start overlay that behaves like a power switch
- a Panic button that reads as an emergency stop
- a canvas that looks like an oscilloscope and a spectrum analyser

## The two systems

The visual language is built from two concurrent systems.

### System 1: the electromagnetic continuum

The background and the readout use the project's conceptual spectrum as an ordering principle:

- left / low = long wavelength, slow, grounding
- right / high = short wavelength, fast, intense
- near-black base with violet-blue at low frequencies and white at gamma

### System 2: the patched terminal

The interface is assembled from:

- thin `1px` borders
- vertical text labels
- narrow mono uppercase captions
- small `rounded-md` cells that are more like tiles than buttons
- rotary knobs built from radial gradient circles and a thin indicator arm
- a fixed background grain grid

## Colour palette

The default background: `#05040a`.

The band colours (from `spectrum.ts`):

| Band | Colour |
| --- | --- |
| Radio | `#6d5bd6` |
| Microwave | `#5b7fd6` |
| Infrared | `#e05b5b` |
| Red | `#ff4d4d` |
| Orange | `#ff9d3d` |
| Yellow | `#ffd93d` |
| Green | `#4dd97a` |
| Blue | `#4d9dff` |
| Violet | `#9d5bff` |
| Ultraviolet | `#c46bff` |
| X-ray | `#5be0e0` |
| Gamma | `#ffffff` |

These are not a generic rainbow. They follow a mixed scientific/symbolic convention: warm thermal comes before red; cool cyan and white mark the shortest wavelengths.

## Typography and the interface's mood

- Unbounded gives display text a slightly "broadcast instrument" weight.
- JetBrains Mono keeps all readouts precise and archival.
- Fraunces provides the single site of "human" writing: the large emotion name. This is the only serif in the system, and it is reserved for the emotional state being played.

## Intentional roughness

The project does not have a hero image or background imagery. It has:

- atmospheric radial gradients that are not perfectly symmetrical,
- a slowly drifting grain grid,
- cells whose shadows vary with band glow,
- a Panic button that is deliberately low-contrast.

This roughness is not accidental. The interface is supposed to feel like a piece of machinery that has been maintained by someone who cares about the instrument but not about software polish. The roughness is the personality of Zazie Productions' "recovered instrument" aesthetic.

## What the visual language excludes

There are no:

- gradients with photos
- rounded comic-style cards
- emojis or decorative icons beyond the functional mode/control set
- drop shadows that imply "website section"
- marketing text outside the conceptual subtitle
- animation that decorates without communicating state
