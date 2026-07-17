// Share of Model analysis helpers: mention detection, the ===META===
// sentiment protocol, and the model call (window.claude in Claude
// environments, /api/ask serverless proxy everywhere else).
//
// Metric definitions used across the tool:
//   Share of Model  = answers mentioning the brand ÷ total queries × 100
//   First-mention   = how often the brand is the first one named in an answer
//   Favorability    = positive mentions ÷ all mentions of that brand × 100

// Normalize for comparison: strip accents (NFD + combining-mark removal),
// lowercase, trim — so "Lacoste" matches "LACOSTE" and "Café X" matches "Cafe X".
export const somNorm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Mention detection rules:
// - Multi-word brands ("Ralph Lauren"): match the exact phrase, or fall back to
//   every significant word (>3 chars) appearing anywhere — catches "Lauren's
//   Ralph Lauren Polo" style reorderings without matching stray short words.
// - Single-word brands: require a whole-word regex match so "Gap" doesn't
//   match "gaps".
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

// The ===META=== protocol: the prompt asks the model to append a machine-
// readable block after its natural answer — one "Brand :: status" line per
// brand (positive | neutral | negative | absent). Everything before the marker
// is the consumer-visible answer; everything after is parsed for sentiment.
export function somSplitMeta(text) {
  const idx = text.indexOf('===META===');
  if (idx === -1) return { answer: text, meta: '' };
  return { answer: text.slice(0, idx), meta: text.slice(idx + 10) };
}

// Parse one brand's status out of the META block. Tolerates list markers and
// numbering before the brand name, prefers an exact normalized name match,
// then falls back to substring containment either way (model abbreviations
// like "J.Crew" vs "J. Crew"). Returns null when the model skipped the brand,
// in which case the caller falls back to somMentions() on the answer text.
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

// First-mention: earliest index in the answer where any brand appears
// (multi-word brands fall back to the earliest significant word when the
// exact phrase is absent).
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
