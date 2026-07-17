export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > 6000)
    return res.status(400).json({ error: 'Bad prompt' });

  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set' });

  let r;
  try {
    r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
  } catch (e) {
    console.error('Gemini fetch failed:', e);
    return res.status(502).json({ error: 'Model error', detail: String(e) });
  }
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
