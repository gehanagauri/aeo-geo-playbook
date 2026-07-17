# How to Be Found by the Machines — AEO/GEO Playbook

Static interactive playbook + live Share of Model audit tool.
Frontend: single-file `index.html` (Claude Design export, pre-flight
fixes applied, OG tags injected). Backend: one Vercel serverless
function (`api/ask.js`) proxying to the Gemini API — the key never
ships to the browser.

## Deploy

1. Push this folder to a GitHub repo (drag-and-drop upload works).
2. vercel.com → Add New Project → import the repo → Deploy.
3. Vercel → Settings → Environment Variables →
   add `GEMINI_API_KEY` (from aistudio.google.com) → Redeploy.
4. Open the live URL → "Try an example" → Run analysis.

## Update later

Re-export from Claude Design → replace `index.html` → commit.
Vercel redeploys automatically. Note: re-injecting the OG meta
tags is needed after each export (the bundler strips them) —
or ask Claude to patch the export before committing.

## Design tweaks panel

Hidden in production. Append `?tweaks` to the URL to open it.
