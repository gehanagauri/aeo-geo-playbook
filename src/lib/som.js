// Share of Model analysis helpers: mention detection, the ===META===
// sentiment protocol, and the model call (window.claude in Claude
// environments, /api/ask serverless proxy everywhere else).

export const somNorm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function somMentions(text, brand) {
  const t = somNorm(text);
  const b = somNorm(brand);
  const words = b.split(/\s+/).filter((w) => w.length > 3);
  if (words.length > 1) {
    if (t.includes(b)) return true;
    if (words.every((w) => t.includes(w))) return true;
    return false;
  }
  const escaped = b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(t);
}

export async function somAskModel(question, brands) {
  const list = brands.join(', ');
  const full =
  `You are a friendly, knowledgeable consumer advisor helping someone pick brands. Answer naturally and concisely, naming SPECIFIC real brands you genuinely recommend, in your natural order of preference. Never refuse to name brands.

QUESTION: ${question}

When finished, output a line containing exactly "===META===" and then, for EACH brand in the list below, one line formatted "Brand :: status" where status is one of: positive, neutral, negative, absent. Use "absent" only if you did NOT name that brand in your answer; otherwise judge the sentiment your answer expressed toward it.
BRANDS: ${list}`;
  const text = window.claude?.complete
    ? await window.claude.complete(full)
    : await fetch('/api/ask', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: full })
      }).then((r) => { if (!r.ok) throw new Error('MODEL ERROR — TRY AGAIN');
        return r.json(); }).then((d) => d.text);
  if (!text || !text.trim()) throw new Error('EMPTY RESPONSE — TRY AGAIN');
  return text;
}

export function somSplitMeta(text) {
  const idx = text.indexOf('===META===');
  if (idx === -1) return { answer: text, meta: '' };
  return { answer: text.slice(0, idx), meta: text.slice(idx + 10) };
}

export function somParseSentiment(meta, brand) {
  const b = somNorm(brand);
  const rows = [];
  for (const raw of meta.split(/\n+/)) {
    const parts = raw.split('::');
    if (parts.length < 2) continue;
    const name = somNorm(parts[0].replace(/^[-*•\d.\)\s]+/, ''));
    if (!name) continue;
    const s = parts.slice(1).join('::').toLowerCase();
    rows.push({ name, s });
  }
  const read = (s) => {
    if (s.includes('positive')) return 'positive';
    if (s.includes('negative')) return 'negative';
    if (s.includes('absent')) return 'absent';
    if (s.includes('neutral')) return 'neutral';
    return null;
  };
  const exact = rows.find((r) => r.name === b);
  if (exact) return read(exact.s);
  for (const r of rows) {
    if (r.name.includes(b) || b.includes(r.name)) {
      const v = read(r.s);
      if (v) return v;
    }
  }
  return null;
}

export function somFirstBrand(answer, brands) {
  let best = null,bestIdx = Infinity;
  const t = String(answer).toLowerCase();
  brands.forEach((b) => {
    const bl = String(b).toLowerCase().trim();
    let i = t.indexOf(bl);
    if (i === -1) {
      const words = bl.split(/\s+/).filter((w) => w.length > 3);
      if (words.length > 1 && words.every((w) => t.includes(w))) {
        i = Math.min(...words.map((w) => t.indexOf(w)));
      }
    }
    if (i !== -1 && i < bestIdx) {bestIdx = i;best = b;}
  });
  return best;
}
