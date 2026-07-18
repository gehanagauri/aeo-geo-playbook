# UI/UX & Design Audit — The AEO/GEO Playbook

Report only; no changes made. Audited on the live production build
(2026-07-18) at 375 / 768 / 1024 / 1440 px, using the deployed Vite app.
Line references point at current source files.

Severity tiers: **Blocker** (undermines the page's job for a
recruiter-facing portfolio), **Should-fix** (visible quality gap),
**Polish** (refinement).

---

## 1. First-impression pass

**Desktop (1440), first 10 seconds.** The hero communicates instantly:
oversized "How to be found by the machines," three stickers establishing
format ("Field Guide / Vol. 01 / For operators"), and a deck that states
the thesis in one sentence. Two clear CTAs. A visitor understands *what
this is* and *who made it is opinionated* within a scroll-free glance.
This is the strongest screen on the site.

**375 px phone.** Same hero holds up well — type scales down cleanly, CTAs
are full-width and comfortably tappable. One defect:

- **[Should-fix] Hero top strip interleaves when wrapping** —
  [Hero.jsx:12](src/components/Hero.jsx) (`justify-between` strip). At
  375 px it renders as "ISSUE 01 / FIELD SHIP. MEASURE. GUIDE ITERATE." —
  the left and right spans wrap into each other and produce nonsense text
  as the very first line of the page. Fix: stack the spans (`flex-col`) or
  hide "Ship. Measure. Iterate." below `md:` like the date span already is.

**Scroll depth to the interactive tool (the portfolio's core proof):**

| Width | Depth to Module 04 |
|---|---|
| 1440 | ~6.8 screens |
| 1024 | ~8.4 screens |
| 768  | ~8.9 screens |
| 375  | **~15.2 screens** |

- **[Blocker] The live tool — the single most differentiating artifact —
  is 7–15 screens deep with no shortcut from the hero.** The hero CTA
  points to the scorecard; the only route to the tool is the TOC card or a
  sticky-nav pill labeled "04 · Share of Model" (meaningless to someone
  who hasn't scrolled). A recruiter skimming for 30 seconds will likely
  never see the one interactive, engineering-backed feature. Suggested
  fix: add a second hero CTA ("Run a live brand audit →" → `#module-04`),
  and/or a persistent "Try the live tool" affordance in the sticky nav.

- **[Should-fix] "Try an example" is discoverable only after reaching the
  tool** — [ShareOfModelTool.jsx:729](src/components/ShareOfModelTool.jsx).
  It's well-placed within Stage 1, but nothing upstream advertises that a
  zero-effort demo exists. Mentioning it in the TOC card copy ("04 — run a
  live audit · 1-click example") or the deep-link CTA would raise trial
  rates for visitors unwilling to type their own brand.

## 2. Information hierarchy & flow

Hero → Why → TOC → 01–05 → Footer is a coherent magazine arc, and the
"you just mapped the gap… this measures it" bridge into Module 04 is
genuinely good editorial sequencing.

Density measurements (1440 px):

| Section | Words | Height |
|---|---|---|
| Hero | 101 | 945 px |
| Why callout | 93 | 522 px |
| TOC | 46 | 460 px |
| 01 Scorecard | 215 | 1,382 px |
| 02 Workflow | 164 | 1,288 px |
| 03 Perception | 244 | 1,420 px |
| **04 Share of Model** | **891** | 1,840 px |
| 05 Vault | 142 | 959 px |
| Footer | 81 | 562 px |

- **[Should-fix] Module 04 carries 3–5× the copy of any other module**
  (891 words visible pre-run). The intro alone stacks: marquee → three
  pills → display headline → deck → burst badge → two-paragraph
  methodology intro → stage tabs. For a non-marketing reader most of this
  is preamble before the first input field. Suggested fix: collapse the
  "Presence, primacy, and sentiment…" paragraph into a disclosure or move
  it beside the results (where the distinction becomes meaningful).
- **[Polish] Module 01's "HOW inVISIBLE" wordplay** —
  [Module01.jsx](src/components/Module01.jsx) — reads as a typo at a
  glance ("How inVisible are you"). Consider styling the "in" more
  distinctly (e.g., the yellow highlight treatment) so the pun is
  unmistakable.
- **[Polish] Two consecutive full-width marquees at the footer seam** —
  Module 05 ends, then the Footer opens with another MarqueeBar; on
  scroll-through the page shows two stacked animated bands with similar
  copy cadence. Consider a static band for one of them.

## 3. Share of Model tool — stage-by-stage

**Stage 1 (Brands).** Clear labels, required markers, "Add 2 to 6. Press
Enter or tap Add." is exactly the right microcopy. Validation error
(`⚠ ADD YOUR BRAND…`) is visible and plain.
- **[Polish] Competitor count mismatch:** copy says "Add 2 to 6," the
  code accepts up to 8 and validates ≥1
  ([ShareOfModelTool.jsx](src/components/ShareOfModelTool.jsx),
  `addCompetitor`/`validate1`). Align copy and constraint.

**Stage 2 (Prompts).** Category accordions with running "n selected"
counts work well.
- **[Should-fix] Placeholder tokens leak into UI when Stage 1 fields are
  empty:** prompts render as "Best preppy coastal apparel brands for
  someone US shoppers 25–45?" — grammatical only by luck; with an empty
  market it renders "…for someone your target audience?" The `{MARKET}`
  fill produces "someone <market>" phrasing —
  [prompts.js:11](src/lib/prompts.js). Suggested fix: rephrase templates
  so the slot is grammatically closed ("for {MARKET}") or filter unfilled
  templates.

**Stage 3 (Run).** The run-summary cells (brands / prompts / queries /
est. time) are excellent expectation-setting.
- **[Should-fix] EST. TIME is optimistic:** `Math.max(8, total * 1.2)`
  seconds ([ShareOfModelTool.jsx:437](src/components/ShareOfModelTool.jsx))
  promises ~8s for the example; observed runs under upstream load take
  15–45 s (the stage copy even says so). Recommend basing the estimate on
  the copy's honest range, or updating it live during the run.
- **Loading communication is strong** — striped progress bar, n/total
  counter, per-prompt RUNNING/DONE list. No changes suggested.
- **[Should-fix] Error states collapse to one message:** every failure
  path (serverless 502, rate-limit 429, network) surfaces as
  "MODEL ERROR — TRY AGAIN" ([som.js:47](src/lib/som.js)). The API now
  returns differentiated statuses; mapping 429 → "Too many runs — wait a
  minute" and 502 → "The model is busy — try again shortly" would stop
  users from retry-hammering a rate limit.

**Results.** The hero number + "mentioned in X of Y answers" caption is
the best moment of the site; the three-way SHARE / FIRST MENTION /
SENTIMENT toggle with per-measure footnotes is well done.
- **[Should-fix] Jargon for non-marketing visitors:** "-25 pp", "pole
  position," "favorability" with no expansion. "pp" especially — a
  recruiter outside marketing won't parse percentage points. Spell out
  "percentage points" once, or use "vs. top competitor: 25 points behind."
- **[Should-fix] Small-sample sentiment reads as certainty:** with depth 1
  and one mention, favorability shows "100%." Suggest annotating
  low-sample measures (e.g., "n=1 — directional") the way the
  "Directional, not absolute" caption already does for the headline.
- **[Polish] Restored-results state is unannounced:** revisiting the page
  silently restores the last run (localStorage) at Stage 3 with no "from
  your last run" chip; a first-time visitor on a shared machine sees
  someone else's brand. A small timestamp chip would resolve it.

## 4. Responsiveness (375 / 768 / 1024 / 1440)

No horizontal page overflow at any audited width (marquee tracks
intentionally overflow inside `overflow-hidden`). Grids collapse sanely.
Specific issues:

- **[Should-fix] Tap targets below 44 px** (WCAG 2.5.8 / mobile
  usability), measured at 375 px:
  - Scorecard "Reset" — **33×17 px** ([Module01.jsx:135](src/components/Module01.jsx))
  - Module 02 "Prev"/"Next" — 87×34 px
  - "Copy prompt" buttons — full-width × 34 px (M05)
  - Footer "Copy" (email) — 74×35 px
  - Sticky-nav "PB" home link — 32×32 px
  - Mobile menu toggle — 38 px wide
  - Competitor-pill "×" removers — ~20 px square
  These persist at all widths (they're fixed-size). The 0/1/2 score
  buttons (44×44) are exactly at threshold — good.
- **[Should-fix] Hero top-strip interleaving at 375 px** (see §1).
- **[Polish] At 768 px the module nav is already hidden** (`md:` shows it,
  but the pills consume most of the bar) — between 768–900 px the
  "Work with me" CTA and pills compete for space; consider dropping the
  CTA to the burger menu below ~900 px.

## 5. Performance

Production build (measured, not estimated):

| Asset | Raw | Gzip |
|---|---|---|
| JS (single chunk) | 267 KB | **81 KB** |
| CSS | 32 KB | 5 KB |
| HTML | 1.2 KB | 0.6 KB |
| Fonts fetched on initial view | 3 files | ~134 KB (woff2) |
| Full font inventory (10 files) | 692 KB total on disk; non-visible subsets never fetched | |

Largest single asset: `fraunces-italic-400-latin.woff2` (~80 KB) — an
italic accent face used for a handful of words per section. DOMContentLoaded
on a warm CDN: ~640 ms. (For context: the pre-migration page shipped
2.37 MB of HTML and compiled JSX in the browser on every load.)

**Lighthouse: not run.** No local Chrome is available in this environment
and the anonymous PageSpeed Insights API quota was exhausted; scores could
not be produced. Run `npx lighthouse https://aeo-geo-playbook.vercel.app`
on any machine with Chrome, or re-try PSI. Accessibility and SEO
fundamentals were verified manually instead (landmarks, single h1, meta/OG
tags, contrast report below).

Top 3 actionable wins:
1. **Preload the three critical fonts** (`<link rel="preload" as="font">`
   for Space Grotesk latin, JetBrains Mono latin, Fraunces italic latin)
   — they're discovered late via CSS today, which risks visible font swap
   on first paint.
2. **Subset or drop the Fraunces italic face on first paint** (80 KB for
   italic flourishes); a `unicode-range` subset covering the actually-used
   glyphs, or accepting serif fallback until loaded, removes the largest
   asset from the critical path.
3. **Code-split `ShareOfModelTool`** (the largest component, ~72 KB of
   source pre-minify) via `React.lazy` — it's 7+ screens below the fold
   and could load on approach, shrinking the initial chunk.

## 6. Consistency

- **[Should-fix] The site's body font is a silent fallback.** The active
  typeset ("modern") declares `body: "Inter"` —
  [PlaybookTweaks.jsx](src/components/PlaybookTweaks.jsx) TYPESETS — but
  Inter was never bundled, so all body text renders in the system sans
  (SF/Helvetica/Segoe depending on OS). The page therefore looks subtly
  different per platform, and the footer colophon "Hand-set in Archivo,
  Space Grotesk & Fraunces" doesn't match what renders (Archivo Black is
  also unused in this typeset). Decide: bundle Inter, or change the
  typeset to a bundled family — then correct the colophon.
- **[Should-fix] Module 04 is a second, parallel design system.** It
  hard-codes its own palette (cream `#f5f1e3`, coral `#ee5530` vs. site
  red `#ef3333`), its own radii (10–20 px while the global theme computes
  36 px "flowy" corners), its own shadow offsets (3–6 px vs. the themed
  6 px), and its own borders (2–2.5 px vs. themed 1–2 px) — all in
  `SOM_STYLES` ([ShareOfModelTool.jsx:36-311](src/components/ShareOfModelTool.jsx)).
  It's internally coherent and reads as intentional "special section," but
  none of it responds to the Tweaks panel, and two near-identical reds /
  two corner languages on one page read as drift, not intent. Suggested
  fix: map `--som-*` onto the global `--c-*` / `--radius` / shadow vars.
- **[Polish] Module 04's accent in nav/TOC is purple `#9f68ff`**
  ([constants.js:8](src/lib/constants.js),
  [TableOfContents.jsx:22](src/components/TableOfContents.jsx)) — a color
  that appears nowhere in the declared five-color palette and nowhere
  inside Module 04 itself.
- **[Polish] The `displayScale` tweak is a no-op:** `--display-scale` is
  set ([PlaybookTweaks.jsx:120](src/components/PlaybookTweaks.jsx)) but no
  stylesheet consumes it. Either wire it into the display clamp() sizes or
  remove the slider.
- **[Polish] Module 04's top band is static while every other band
  scrolls** (`.som-marquee`,
  [ShareOfModelTool.jsx:45](src/components/ShareOfModelTool.jsx)) —
  fine if intentional, but it visually promises the same marquee behavior.
- Spacing/typography elsewhere is disciplined: modules share the
  `px-6/12/20 · py-16/20` rhythm, `SectionTag` + display-clamp headline +
  `text-lg` deck pattern, and the sticker/card/shadow vocabulary is applied
  uniformly across modules 01–03/05.

## 7. Accessibility contrast report (AA, default theme)

Computed ratios (WCAG 2.1; 4.5:1 normal text, 3:1 large text). Failures
only — **no colors were changed**, per instruction:

| Pair | Ratio | Verdict |
|---|---|---|
| White on red `#ef3333` (CTAs, "Invisible" verdict, nav CTA) | **4.05** | Fails AA for normal-size text; passes as large/bold display |
| White on coral `#ee5530` (RUN button, error banner, som accents) | **3.51** | Fails AA for its 12–16 px uses |
| White on blue `#4f7df0` (som pills, rank dots) | **3.80** | Fails AA for 13–14 px pill text |
| Coral on white (scribble annotations, 23 px Caveat bold) | 3.51 | Passes as large text |

Everything else audited (ink/paper at every opacity step used, ink on
yellow/mint/blue/pink, cream-on-ink results card, mute-on-cream) passes —
most pairs exceed 7:1. The three failures are all "white text on a warm
mid-tone" cases; darkening each background ~15% (e.g., red → `#d92525`,
coral → `#d63d1a` — already in the palette as `--som-coral-d`) would clear
AA without changing the visual language.

---

## Prioritized top-10 (hand back as design-change instructions)

1. Add a hero-level route to the live tool ("Run a live brand audit →")
   — it's the portfolio's proof-of-work and is 7–15 screens deep.
2. Fix the 375 px hero top-strip interleaved wrap (stack or hide spans).
3. Bring the three failing white-on-warm color pairs to AA (use existing
   darker palette steps; e.g., coral → `--som-coral-d`).
4. Enlarge sub-44 px tap targets: scorecard Reset, pill removers,
   Prev/Next, footer Copy, PB home link.
5. Differentiate tool error messages (rate-limited vs. model-busy vs.
   offline) now that the API distinguishes them.
6. Decide the body font: bundle Inter or switch the typeset to a bundled
   family; correct the footer colophon to match reality.
7. Unify Module 04's parallel design system onto the global theme vars
   (one red, one corner radius language, themed shadows).
8. Trim Module 04's pre-input copy (~891 words) — collapse the
   methodology paragraph into a disclosure or move it to results.
9. Translate results jargon for non-marketers ("percentage points," a
   low-sample "directional" annotation on sentiment).
10. Performance pass: preload critical fonts, subset/defer Fraunces
    italic, lazy-load ShareOfModelTool.
