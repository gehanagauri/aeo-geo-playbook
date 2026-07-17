// Serverless proxy to the Gemini API. The key lives only in the
// GEMINI_API_KEY environment variable — it never reaches the browser, and
// upstream error bodies are logged server-side but never returned to the
// client.
//
// gemini-2.5-flash was retired for new API keys on 2026-07-09 (the API
// returns 404). Primary is its stable replacement; the lite model is the
// fallback because 3.5-flash frequently 503s ("high demand") on new keys.
const MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];

const MAX_PROMPT_CHARS = 6000;
const UPSTREAM_TIMEOUT_MS = 20000;

// Best-effort per-IP rate limit. Vercel serverless instances don't share
// memory, so this bounds abuse per warm instance only (a determined client
// that lands on N instances gets N budgets). Real quota enforcement lives
// with the Gemini key itself; this just keeps one IP from burning it.
const RATE_LIMIT = 30;            // requests
const RATE_WINDOW_MS = 60_000;    // per minute
const hits = new Map();           // ip -> [timestamps]

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 10_000) hits.clear(); // cap memory on long-lived instances
  return list.length > RATE_LIMIT;
}

// Same-origin check: browsers attach an Origin header to fetch() POSTs.
// When present it must match this deployment's own host (production or
// preview) or localhost dev. Requests without an Origin (curl, server-to-
// server) pass — the endpoint holds no secrets and rate limiting applies.
function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  let host;
  try { host = new URL(origin).hostname; } catch { return false; }
  const own = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
  return host === own || host === 'localhost' || host === '127.0.0.1';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!String(req.headers['content-type'] || '').includes('application/json'))
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  if (!originAllowed(req)) return res.status(403).json({ error: 'Forbidden' });

  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) return res.status(429).json({ error: 'Too many requests — slow down' });

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > MAX_PROMPT_CHARS)
    return res.status(400).json({ error: 'Bad prompt' });

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  let r = null;
  tryModels:
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
          }
        );
      } catch (e) {
        console.error(`Gemini fetch failed (${model}):`, e);
        r = null;
        continue;
      }
      // 503 = temporary high demand, 429 = rate limit: retry once, then
      // move on to the fallback model
      if (r.status !== 503 && r.status !== 429) break tryModels;
      console.error(`Gemini ${model} returned ${r.status}, retrying`);
      await new Promise((done) => setTimeout(done, 1000));
    }
  }

  if (!r || !r.ok) {
    // Log the real upstream failure for `vercel logs`; the client gets a
    // generic message with no upstream body and no key material.
    if (r) console.error('Gemini error', r.status, (await r.text()).slice(0, 2000));
    return res.status(502).json({ error: 'Model unavailable — try again' });
  }

  const data = await r.json();
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text).join('') || '';
  res.status(200).json({ text });
}
