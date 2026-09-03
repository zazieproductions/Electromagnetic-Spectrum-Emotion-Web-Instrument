# Creative System

This document treats the project as a creative-technology work rather than only as an application. It explains what the technical constraints mean artistically.

## The premise

The electromagnetic spectrum is a real ordering of the universe. It is also a cultural object: we say "radio static", "red hot", "green envy", "x-ray vision", "gamma burst". The Emotion Spectrum takes that ordering and treats it as a player-facing emotional geography.

The bands are not chosen randomly. They inherit the symbolic weight of the objects they name:

| Band | Symbolic register | Emotional family |
| --- | --- | --- |
| Radio | broadcast, distance, the air | stillness, longing, solitude |
| Microwave | domestic technology | comfort, nostalgia, belonging |
| Infrared | body heat, closeness | tenderness, love, passion |
| Visible | the human eye | desire, joy, sorrow |
| Ultraviolet | invisible intensity | anxiety, anticipation |
| X-ray | diagnosis, exposure | fear, revelation, clarity |
| Gamma | destruction, stars | ecstasy, transcendence, rapture |

## The core procedure

**The player performs a spectrum.**

- Left is long, slow, warm, grounded.
- Right is short, fast, cold, intense.
- The transition is continuous even though the interface is split into cells.
- The sound timbre makes the metaphor legible: more energy = brighter, shorter, more aggressive.

The instrument does not attempt to prove that "anger is red" or "love is infrared". It constructs a playable fiction and then makes the fiction acoustically true within its own rules.

## What the code is doing conceptually

The codebase is not a wrapper around a synthesis library. It is a small set of direct, legible decisions:

- 12 bands × 5 emotions = 60 cells.
- Major-pentatonic consonant field so any drone is listenable.
- One synth per cell.
- One continuous theremin voice.
- No randomness, no presets, no save.

Those constraints are what make the work feel like an instrument rather than a visual toy. The programmer's constraint *is* the artist's constraint: the piece is stable enough that the player can develop a relationship with it.

## Intentional instability

The project's poetic identity includes the possibility of misuse:

- A dense drone with high Drive and low Master can be grating, but the compressor catches the worst peaks.
- Theremin with high Glide can smear into a tonal fog unrelated to the band labels.
- The interface does not prevent you from playing hostile combinations.

This is not a bug. The interface is not protective in the way an art website is. It is a machine you are allowed to overdrive.

## The lost-signal aesthetic

Several visual decisions read as a system that is being recovered from a malfunctioning archive:

- monochrome terminal chrome
- readouts that announce a frequency and wavelength with too much precision
- cell labels that are vertical, like old tape spines
- a Panic button that is deliberately uninflected
- a background grain grid that drifts slightly but never resolves

The Emotion Spectrum is positioned as an artifact of a larger Zazie Productions archive: a recovered instrument that has been repaired just enough to be played.

## What is not in the piece

- **No data-driven realism.** It does not pretend that radio waves map to "longing".
- **No generative autonomy.** There is no algorithm making decisions for you.
- **No persistence.** Every session is ephemeral.
- **No explanation layer.** The interface never explains the mapping. All context is in the labels and the sound.

These absences are as deliberate as the presence of the bands.
