// gemini-2.5-flash was retired for new API keys on 2026-07-09 (Gemini API
// returns 404). Primary is its stable replacement; the lite model is the
// fallback because 3.5-flash frequently 503s ("high demand") on new keys.
const MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > 6000)
    return res.status(400).json({ error: 'Bad prompt' });

  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set' });

  let r = null;
  let lastError = '';
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
            signal: AbortSignal.timeout(20000)
          }
        );
      } catch (e) {
        console.error(`Gemini fetch failed (${model}):`, e);
        lastError = String(e);
        r = null;
        continue;
      }
      // 503 = temporary high demand, 429 = rate limit: retry once, then
      // move on to the fallback model
      if (r.status !== 503 && r.status !== 429) break tryModels;
      lastError = `${model} returned ${r.status}`;
      await new Promise(done => setTimeout(done, 1000));
    }
  }

  if (!r) return res.status(502).json({ error: 'Model error', detail: lastError });
  if (!r.ok) {
    const body = await r.text();
    console.error('Gemini error', r.status, body.slice(0, 2000));
    return res.status(502).json({
      error: 'Model error',
      upstreamStatus: r.status,
      detail: body.slice(0, 600)
    });
  }
  const data = await r.json();
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map(p => p.text).join('') || '';
  res.status(200).json({ text });
}
