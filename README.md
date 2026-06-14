# Open Knowledge — AI & Open Educational Resources

A CUNY AI Lab session for the **Open Knowledge Fellowship** at the CUNY Graduate
Center. A redraft of the original deck, rebuilt around critical AI literacy for
an audience new to AI and broadly wary of it.

**Live:** https://zweibel.net/open-knowledge/

## What it is
A single-page, static HTML slide deck — no build step. Open `index.html`
directly, or serve the folder (`python3 -m http.server`). 29 slides, four parts,
~30-minute talk followed by a separate ~30-minute discussion.

## Premise
Not a sell and not a scare. The goal is to give novices enough understanding to
**judge appropriate AI use in OER work — including the choice to refuse.** The
thesis is precision: sort what holds up from where the public framing overstates
it, *with* the room, never at it. See `OUTLINE.md` for the full spec.

## Structure
- `index.html` — all slides inline.
- `css/` — deck engine + the warm light theme (`theme-light.css`, loaded last).
- `js/` — navigation, carousels, lightbox, scrubber. Engine inherited from the
  original `open-knowledge` deck.
- `images/` — screenshots reused from the original deck.
- `OUTLINE.md` — the working spec (audience, thesis, slide-by-slide, tone guard).

## Still open
- Slide 27 is a placeholder for one honest example (a real project that worked,
  and where it broke).
