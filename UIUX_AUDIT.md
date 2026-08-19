# UI/UX & Design Review

A structured audit of the live site, and what shipped in response. Findings
are grouped by outcome so this file stays a record of decisions rather than
a stale wishlist. Measurements are from the production build.

Audited at 375 / 768 / 1024 / 1440 px.

---

## Resolved

### 1. The live tool was unreachable from the first screen — *Blocker*

**Was:** Module 04 is the only interactive, engineering-backed artifact on
the page, and it sat 6.8 screens down on desktop and **15.2 screens** down at
375 px. The hero's only CTA pointed at the scorecard. A visitor skimming for
30 seconds would never see it.

**Now:** The primary hero CTA is "Run the live audit" → `#module-04`, with a
line underneath stating there is no signup and a one-click example. The
scorecard became the secondary CTA.

### 2. Results took ~2,600px to read — *Blocker*

**Was:** A full-bleed hero card (a 264px numeral, three stat boxes, mostly
empty space), then a separate leaderboard card, then an always-expanded
prompt list, then insights, then methodology. Roughly three screens of
scrolling before a visitor understood the outcome.

**Now:** One card — a compact dark stat header (brand, three KPIs, one
plain sentence) flowing straight into the comparison chart — followed by
insights, then two disclosures. **Results region: 2,600px → 998px**, 111
words. Prompt-by-prompt detail and methodology are folded away by default.

### 3. The comparison was a rank-colored lollipop chart — *Should-fix*

**Was:** Each brand's dot took a different hue keyed to its *rank*
(`rank-2`, `rank-3`…), so colors repainted as positions changed and the
reader's own brand had no consistent visual identity.

**Now:** An **emphasis** chart — the reader's brand in the accent, every
competitor in one recessive gray, sorted descending, with hairline
gridlines at 25% intervals, a 0–100% axis, and a direct value label on every
bar. A 0% score renders a visible stub so it reads as *measured zero* rather
than *missing data*. Colour is never the only channel: the reader's row also
carries a ★ and a direct label (CVD ΔE 11.9 protan, comfortably clear of the
separation floor).

### 4. Module 04 was a parallel design system — *Should-fix*

**Was:** It hard-coded its own typeface stack (Archivo 800 at its own
scale), so the section headline visibly disagreed with every other module,
plus its own reds, radii and shadow offsets.

**Now:** `--som-display / --som-sans / --som-serif` inherit the site theme.
The headline is now byte-identical in treatment to modules 01–03/05
(same face, same `clamp(40px,7vw,96px)`, same leading), and it follows the
Tweaks panel like everything else.

### 5. Muted text wasn't muted — *Blocker (latent)*

**Was:** The bundled Tailwind stylesheet was pre-purged and shipped with
**no opacity-modifier classes at all**. Every `text-ink/60` caption,
`text-paper/70` sub-label and `border-ink/20` divider rendered at full
strength, and the sticky nav's `bg-paper/90` frosted effect never appeared.
Typographic hierarchy was silently flattened site-wide — a significant part
of why the page read heavier than it was written to.

**Now:** The ~20 missing utilities are defined in `theme.css` via
`color-mix()`, so they stay tied to the theme variables and still respond to
a palette change. Also restored: `top-6`, `pr-12`, `sm:flex`, `lg:inline`,
`xl:block` (the hero sticker had never once rendered).

### 6. The hero's postage stamp rendered as stray lines — *Should-fix*

**Was:** A five-layer `mask-composite` perforation that collapses in Chrome,
leaving a dashed fragment where a stamp should be.

**Now:** Rebuilt from the same border + hard-shadow vocabulary as `Card`.
The scalloped edge is gone rather than broken.

### 7. Jargon density — *Should-fix*

Removed: "retrieval-augmented generation", "indexed corpus", "citation
equity", "presence, primacy and sentiment", "pp" (now "points"), "pole
position". The Module 04 deck plus two intro paragraphs became one
paragraph. Results copy is now plain: *"Named in 4 of 4 answers. That's 12
points ahead of Ralph Lauren."*

### 8. Contrast failures — *Should-fix*

| Pair | Was | Now |
|---|---|---|
| White on red (CTAs, verdict) | 4.05 ✗ | **4.95** ✓ (`#d92525`) |
| White on coral (run button, errors) | 3.51 ✗ | **4.62** ✓ (`#d63d1a`) |
| White on blue (pills, dots) | 3.80 ✗ | **5.23** ✓ (`#3f66cf`) |
| `text-ink/40` micro-label | — | **5.25** ✓ (moved to /60) |

Every text/background pair in the default theme now clears WCAG AA.

### 9. Smaller fixes

- Module 03: the "NOW" badge overlapped the struck-through text.
- Tap targets below 44px: scorecard Reset, footer Copy, the measure toggle.
- 375px: the hero utility strip wrapped into itself
  ("ISSUE 01 / FIELD SHIP. MEASURE. GUIDE ITERATE.").
- 375px: the chart track collapsed to 83px; the row now puts the label above
  a full-width bar (**241px**) and the segmented control sits 3-across.
- Error states: 429 / 502 / 504 / offline now give different, actionable
  messages instead of one "MODEL ERROR".
- The hero sticker claimed a 22-minute read for ~1,200 words of prose; it
  now states what the page contains.
- Module 04's nav/TOC accent was `#9f68ff`, a purple appearing nowhere else.
- The footer colophon named fonts that were not the ones rendering.
- A tie now reads "Level with X" rather than "0 points ahead of X".

---

## Open — deliberate, for a future pass

- **Body font is a system fallback.** The active typeset asks for Inter,
  which is not bundled, so body copy renders in the platform sans (SF on
  macOS, Segoe on Windows). It looks intentional on a Mac but differs across
  platforms. Fix is a decision, not a bug: bundle Inter (+~100KB) to keep the
  current look everywhere, or switch the typeset to the already-bundled
  Space Grotesk. Left alone because it changes every line of body copy.
- **`displayScale` is a no-op.** The Tweaks slider sets `--display-scale`
  and no stylesheet consumes it. Either wire it into the display clamps or
  drop the control.
- **Dated content will go stale.** The masthead reads "Apr 2026" and the
  footer marquee "Available Q3" — both are editorial//personal claims, so
  they are the author's to update.
- **Page length.** ~9,200px, roughly nine screens. Appropriate for a field
  guide, and each module now earns its space, but a "jump to a module"
  affordance in the sticky nav would help a skimmer.

---

## Performance

| Asset | Raw | Gzip |
|---|---|---|
| JS (single chunk) | 263 KB | **80 KB** |
| CSS | 34 KB | 5.4 KB |
| Fonts (10 files, Latin subsets only) | 476 KB on disk; 3 fetched on first view | |

For contrast, the pre-migration page shipped a 2.37 MB HTML file that
compiled JSX in the browser on every load.

Top three remaining wins:

1. **Preload the three first-paint fonts** — they are discovered late via
   CSS, risking a visible swap.
2. **Subset or defer Fraunces italic** (~80 KB, the largest single asset,
   used for accent words only).
3. **Lazy-load `ShareOfModelTool`** — the largest component, below the fold.

**Lighthouse was not run:** no local Chrome in the build environment and the
anonymous PageSpeed Insights quota was exhausted. Run
`npx lighthouse https://aeo-geo-playbook.vercel.app` on any machine with
Chrome for scores. Accessibility was instead verified by hand — single `h1`,
ordered headings, landmarks, skip link, `aria-expanded` on every disclosure,
`aria-live` results region, focus moved to the results heading on completion,
a full keyboard walkthrough of an audit run, `prefers-reduced-motion`
honored on every animation, and the contrast table above.
