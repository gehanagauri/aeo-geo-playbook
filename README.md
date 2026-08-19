# How to Be Found by the Machines — The AEO/GEO Playbook

An interactive field guide to Answer Engine Optimization and Generative
Engine Optimization, with a live **Share of Model** audit tool that measures
how often an AI model actually recommends your brand.

Live: https://aeo-geo-playbook.vercel.app

## What it is

Five interactive modules in a pop-art editorial layout:

1. **Opportunity Scorecard** — score your AI visibility across five
   retrieval dimensions, get a verdict.
2. **Unified Workflow** — the Probe / Patch / Persist loop, seven steps.
3. **Perception Gap Canvas** — the story models tell about you today vs.
   the narrative to feed them.
4. **Share of Model** — the live tool. Enter your brand, category, and
   competitors; pick probe prompts; the tool queries a model in parallel and
   charts how often each brand is named, named first, and spoken well of —
   your brand emphasised against the field — with a per-prompt breakdown and
   CSV export.
5. **Prompt Vault** — nine copy-ready probe prompts.

## Architecture

Static Vite + React frontend, one serverless function.

```
index.html          Vite entry — meta/OG tags + TWEAK_DEFAULTS theme block
src/
  main.jsx          mounts <App>, imports the three stylesheets
  App.jsx           page composition (Hero → modules → Footer)
  components/       one file per section + shared primitives
  lib/som.js        mention detection, ===META=== sentiment protocol, model call
  lib/prompts.js    Share of Model prompt library
  lib/constants.js  section ids / labels / accent colors
  styles/           self-hosted fonts, compiled Tailwind utilities, theme vars
api/ask.js          Vercel serverless proxy to the Gemini API
```

The Gemini API key lives only in a Vercel environment variable
(`GEMINI_API_KEY`); the browser never sees it. The frontend calls
`window.claude.complete` when embedded in a Claude environment and falls
back to `POST /api/ask` otherwise. The proxy validates input, retries
transient 503/429 responses, and falls back from `gemini-3.5-flash` to
`gemini-3.1-flash-lite` under load.

## Share of Model methodology

Each selected prompt is sent to the model live, in parallel, 1–3 times
depending on the chosen depth. A brand counts as *mentioned* in an answer
when the model's own ===META=== self-report says so, with text-matching as
fallback. **Share of Model = mentions ÷ total queries × 100.** First-mention
rate tracks how often a brand is the first one named — the model's default.
Tone (favorability) is the share of a brand's mentions the model frames
positively. Results are directional, not absolute: the value is the delta
across repeated runs on a fixed prompt set, which the tool tracks between
sessions.

## Local development

```
npm install
npm run dev          # frontend only; /api/ask is not served
vercel dev           # frontend + the api/ function (requires vercel login)
```

To exercise the model call under `vercel dev`, put `GEMINI_API_KEY=...` in
`.env` (already gitignored).

## Deploy

Pushes to `main` deploy via Vercel. `vercel.json` pins the build
(`npm run build` → `dist/`) and the function timeout, so no dashboard
configuration is required. Set `GEMINI_API_KEY` in Vercel → Settings →
Environment Variables.

## Design tweaks panel

Append `?tweaks` to the URL to open the palette/typography/shape panel.
Values persist into `index.html`'s `TWEAK_DEFAULTS` block when hosted in
Claude Design; in a plain browser they apply for the session only.

## Design & accessibility

The results chart is an *emphasis* form — one accent for the reader's brand,
one recessive gray for the field — rather than a colour per brand, so colour
never encodes rank and the reader's own bar is always identifiable. Colour is
never the sole channel: every bar carries a direct value label and the
reader's row is starred.

Every text/background pair in the default theme clears WCAG AA. The page has
one `h1` with ordered headings, landmarks, a skip link, `aria-expanded` on
each disclosure, an `aria-live` results region, focus moved to the results
heading when an analysis completes, and `prefers-reduced-motion` honored on
every animation. An entire audit run is completable by keyboard alone.

[UIUX_AUDIT.md](UIUX_AUDIT.md) records the review this came out of.

## License

MIT — see [LICENSE](LICENSE).
