# Migration Notes — Phase 0 assessment (2026-07-17)

## Repo state before migration

```
index.html   2.37 MB  — single-file Claude Design export (self-extracting bundle)
api/ask.js   2.2 KB   — Vercel serverless proxy to the Gemini API (real source, keep)
vercel.json  65 B     — maxDuration 60 for api/ask.js
README.md             — original deploy notes
.env / .gitignore     — local key placeholder (ignored), added in debug session
```

## How the bundled index.html works

`index.html` is not hand-written HTML. It is a loader plus three typed
`<script>` blocks:

1. `__bundler/manifest` — JSON map of UUID → `{mime, compressed, data}`.
   `data` is base64, gzip-compressed when `compressed` is true. 37 entries:
   - 4 vendor libs: React 18 (development build), ReactDOM (development
     build), Babel standalone, lucide 0.460.0
   - 12 app source files (JSX, served as `text/babel` and compiled in the
     browser by Babel at every page load)
   - 20 `.woff2` font subsets, and 1 tweaks-panel helper (`text/jsx`)
2. `__bundler/ext_resources` — empty (`{}`).
3. `__bundler/template` — JSON-encoded string of the real HTML document.
   The loader script (top of index.html) decompresses every manifest entry
   into a blob URL, rewrites the template's UUID `src`/`url()` references
   to those blob URLs, and injects the result.

## The real app inside the template

Head: `<title>`, meta description, `og:title` / `og:description` /
`og:type` — must be preserved verbatim in the migrated root index.html.

Four `<style>` blocks:
1. `@font-face` set A (UUID srcs): Archivo Black, Caveat, others
2. Compiled Tailwind CSS 3.4.17 utilities (pre-purged) — consumes CSS
   variables `--c-ink/--c-paper/--c-1..5`, `--font-display/body/accent`
3. Custom theme CSS: `:root` pop-art palette defaults, `.border-ink-*`,
   shadow/marquee/animation classes
4. `@font-face` set B: Fraunces, Space Grotesk, JetBrains Mono subsets

Inline script: `window.TWEAK_DEFAULTS` (palette "pop", typeset "modern",
shape "flowy", borderWeight 1, shadowStyle "hard", displayScale 0.95) —
persisted by the Tweaks panel between exports.

App scripts, in load order (last one mounts):

| Bundle id | Content | Target file |
|---|---|---|
| 5b6ec2e7 | Tweaks shell + form-control helpers (edit-mode host protocol) | src/components/PlaybookTweaks (support) |
| 044b21bb | `Icon` — lucide wrapper | src/components/Icon |
| 38ab524e | Shared primitives: Sticker, BurstBadge, PostageStamp, SectionTag, Card, MarqueeBar, Diamond, Dot, Spark | src/components/primitives |
| e0b5b12e | `Hero` | src/components/Hero |
| cfe222ba | `SCORE_DIMENSIONS` + Module01 scorecard | src/components/Module01 |
| 228c90ec | `WORKFLOW_STEPS` + Module02 workflow | src/components/Module02 |
| cccf2621 | `PERCEPTION_ROWS` + Module03 perception | src/components/Module03 |
| 099ed389 | Share of Model (1,176 lines): `ShareOfModelTool`, som helpers (`somNorm`, `somMentions`, `somSplitMeta`, `somParseSentiment`, `somAskModel`), prompt builders, results UI | src/components/ShareOfModelTool + src/lib/ |
| 845981fd | `PROMPT_VAULT` + Module05 vault | src/components/Module05 |
| 73b0865e | `Footer` | src/components/Footer |
| d925dffa | Tweak theme tokens + `PlaybookTweaks` panel | src/components/PlaybookTweaks |
| 1e4d03c4 | `ScrollProgress`, `StickyNav`, `TableOfContents`, `WhyCallout`, `App`, `ReactDOM.createRoot(...).render(<App />)` | src/components/StickyNav etc. + src/main.jsx |

Behavior that must survive the migration exactly:
- `?tweaks` query gating: `window.location.search.includes('tweaks')`
  conditionally renders `<PlaybookTweaks />` (App, nav.jsx line 168)
- Model call fallback (module04 ~line 337): `window.claude?.complete`
  first, else `POST /api/ask` with `{prompt}` JSON
- All copy, palette variables, and the pop-art visual system

## Changes made in the earlier debugging session (already on main)

- `eb7f00e` — api/ask.js surfaces upstream Gemini status + error body;
  guards missing GEMINI_API_KEY; removed stray duplicate `ask.js` at repo
  root; added .gitignore (+ local-only .env placeholder)
- `3a1371b` — model switched to `gemini-3.5-flash` (Google retired
  `gemini-2.5-flash` for new API keys on 2026-07-09; API returns 404)
- `edd8eab` — retry on Gemini 503/429 with backoff
- `12201cc` — fallback to `gemini-3.1-flash-lite` when 3.5-flash is
  congested; 20s per-call abort; vercel.json maxDuration 60

## Migration risks noted for Phase 1

- Vendor libs are **development** builds compiled in-browser by Babel on
  every load; Vite build swaps these for production React and build-time
  JSX — the single biggest payload/perf win, no visual impact expected.
- App files share one global scope (no imports/exports); converting to ES
  modules requires adding explicit imports and export statements without
  touching logic.
- Tailwind utilities are a pre-compiled, purged stylesheet. Safest
  pixel-faithful path: keep that compiled CSS as a static stylesheet
  rather than re-running Tailwind with a config that might purge or emit
  differently.
- Fonts: 20 woff2 subsets across 5+ families; alternate typesets are
  runtime options of the Tweaks panel. Which are unreachable in the
  default theme is a Phase 2 decision, not Phase 1.
- Reported duplicate `somMentions`: only one definition found in the
  extracted sources (module04 line 315, plus one call site). Re-verify
  during Phase 2 dead-code pass against the raw bundle.
