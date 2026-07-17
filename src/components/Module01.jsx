// Module 01 — Opportunity Scorecard: score five retrieval dimensions 0/1/2,
// get a live total and a verdict card.
import React, { useState, useMemo } from 'react';
import { SectionTag, Card, Spark } from './primitives.jsx';

const SCORE_DIMENSIONS = [
  {
    id: 'visibility',
    label: 'Brand visibility in answers',
    blurb: 'When users ask the obvious question in your category, does the model name you?',
    examples: ['0 — Never mentioned', '1 — Sometimes, with prompting', '2 — Cited as a default option'],
  },
  {
    id: 'narrative',
    label: 'Narrative control',
    blurb: 'Is the description it gives of you the one you want?',
    examples: ['0 — Wrong story', '1 — Partially correct', '2 — Word-for-word your messaging'],
  },
  {
    id: 'sources',
    label: 'Source coverage',
    blurb: 'How many independent, citable sources back the model\'s claims about you? This is citation equity — the same compounding logic backlinks had in classic SEO, now measured in trusted mentions across the corpus the model retrieves from.',
    examples: ['0 — One or zero', '1 — A handful, mostly owned', '2 — Many, mostly third-party'],
  },
  {
    id: 'comparative',
    label: 'Comparative positioning',
    blurb: 'When the model compares you to a rival, who comes out ahead?',
    examples: ['0 — They do, by a mile', '1 — Mixed signal', '2 — You do, with reasons cited'],
  },
  {
    id: 'freshness',
    label: 'Freshness & cadence',
    blurb: 'Are recent facts about you reaching the index — within weeks, not years?',
    examples: ['0 — Stale (12+ months)', '1 — Quarterly drift', '2 — Always within 30 days'],
  },
];

const VERDICTS = [
  { min: 0, max: 3, label: 'Invisible', color: '#ef3333', textColor: '#ffffff',
    body: 'You are not in the conversation. The models pick a story without you and the next buyer never types your name. Triage required.' },
  { min: 4, max: 7, label: 'Exposed', color: '#ffd95c', textColor: '#0A0A0A',
    body: 'You appear, but on someone else\'s terms. A competitor with cleaner narrative scaffolding will overwrite you in two quarters. Get tactical.' },
  { min: 8, max: 10, label: 'Defended', color: '#a9e1c6', textColor: '#0A0A0A',
    body: 'You own the answer. Now hold it: cadence, comparatives, and citation hygiene are your moat. Don\'t coast.' },
];

const Module01 = () => {
  const [scores, setScores] = useState(() => Object.fromEntries(SCORE_DIMENSIONS.map(d => [d.id, null])));

  const total = useMemo(() => {
    return Object.values(scores).reduce((a, v) => a + (v ?? 0), 0);
  }, [scores]);

  const answered = useMemo(() => Object.values(scores).filter(v => v !== null).length, [scores]);
  const complete = answered === SCORE_DIMENSIONS.length;

  const verdict = useMemo(() => {
    if (!complete) return null;
    return VERDICTS.find(v => total >= v.min && total <= v.max);
  }, [total, complete]);

  const reset = () => setScores(Object.fromEntries(SCORE_DIMENSIONS.map(d => [d.id, null])));

  return (
    <section id="module-01" className="border-b-4 border-ink bg-paper">
      <div className="px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-8">
            <SectionTag number="01" title="The Opportunity Scorecard" color="#ef3333" />
            <h2 className="font-display uppercase leading-[0.9] text-[clamp(40px,7vw,96px)]">
              How <span className="italic font-serif font-normal lowercase">in</span>visible<br/>
              are you, really?
            </h2>
            <p className="mt-6 max-w-2xl text-lg">
              Five dimensions. Score each one zero, one, or two. The number you end up with is the
              first honest signal you have for whether to keep what you're doing or rebuild it on evidence.
              Each dimension is a retrieval signal — how readily the model can find you, trust you, and
              prefer you when it assembles its answer.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <Card color="#ffd95c" className="p-4 max-w-sm rot2">
              <div className="font-mono uppercase text-xs tracking-[0.2em] mb-2">Cost of inaction</div>
              <div className="font-display uppercase leading-tight text-2xl">
                Every quarter you don't measure, a competitor writes your story.
              </div>
            </Card>
          </div>
        </div>

        {/* Scoring legend — single source of truth */}
        <Card color="#ffffff" className="p-4 md:p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60">How to score</span>
              <span className="font-serif italic text-ink/70 text-sm">Apply the same scale to every row.</span>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-3 flex-1 min-w-0">
              {[
                { n: 0, label: 'Absent / wrong', bg: '#ef3333', tc: '#ffffff' },
                { n: 1, label: 'Partial / mixed', bg: '#ffd95c', tc: '#0A0A0A' },
                { n: 2, label: 'Owned / strong', bg: '#a9e1c6', tc: '#0A0A0A' },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3 border-ink-3 px-3 py-2" style={{ background: s.bg, color: s.tc }}>
                  <span className="font-display text-2xl leading-none">{s.n}</span>
                  <span className="font-mono uppercase text-[10px] tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Scorecard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            {SCORE_DIMENSIONS.map((d, i) => (
              <DimensionRow
                key={d.id}
                index={i + 1}
                dimension={d}
                value={scores[d.id]}
                onChange={(v) => setScores(s => ({ ...s, [d.id]: v }))}
              />
            ))}
          </div>

          {/* Result panel */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              <Card color="#0A0A0A" className="p-5 text-paper">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono uppercase text-[11px] tracking-[0.2em]">AI Invisibility Score</span>
                  <button onClick={reset} className="font-mono text-[11px] uppercase underline underline-offset-2 hover:text-pop-yellow">
                    Reset
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[110px] leading-none">{total}</span>
                  <span className="font-mono text-2xl text-paper/60">/10</span>
                </div>
                <div className="mt-3 h-3 w-full bg-paper/15 border border-paper/30 relative">
                  <div className="h-full" style={{ width: `${(total/10)*100}%`, background: verdict?.color || '#ffffff' }} />
                </div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
                  {answered} of {SCORE_DIMENSIONS.length} answered
                </div>
              </Card>

              <div className="relative">
                {complete && verdict ? (
                  <Card color={verdict.color} className="p-5" tilt={-1}>
                    <div className="flex items-center gap-2 mb-2">
                      <Spark size={18} color="#0A0A0A" />
                      <span className="font-mono uppercase text-[11px] tracking-[0.2em]">Verdict</span>
                    </div>
                    <div className="font-display uppercase text-5xl leading-none mb-3" style={{ color: verdict.textColor }}>
                      {verdict.label}
                    </div>
                    <p className="leading-snug" style={{ color: verdict.textColor }}>{verdict.body}</p>
                  </Card>
                ) : (
                  <Card color="#ffffff" className="p-5 border-dashed" tilt={1}>
                    <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2 text-ink/60">Awaiting scores</div>
                    <p className="text-ink/70">Toggle a value (0 / 1 / 2) on every dimension to lock in your verdict.</p>
                  </Card>
                )}
              </div>

              <Card color="#8baaff" className="p-4 text-ink">
                <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2">Pro-tip</div>
                <p className="text-sm leading-snug">
                  Re-run this every 6 weeks with the same five prompts. The trend matters more than the snapshot.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const DimensionRow = ({ index, dimension, value, onChange }) => {
  const colors = ['#ef3333', '#ffd95c', '#a9e1c6'];
  return (
    <Card color="#ffffff" className="p-4 md:p-5">
      <div className="flex items-start gap-5 flex-wrap md:flex-nowrap">
        <div className="font-display text-5xl leading-none w-14 flex-shrink-0">{String(index).padStart(2,'0')}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display uppercase text-2xl leading-tight">{dimension.label}</h3>
          <p className="mt-1 text-ink/75">{dimension.blurb}</p>
        </div>
        <div className="flex gap-2 ml-auto flex-shrink-0">
          {[0,1,2].map(n => (
            <button
              key={n}
              onClick={() => onChange(value === n ? null : n)}
              className={`btn-pop w-11 h-11 border-ink-3 font-display text-xl leading-none ${value === n ? 'shadow-pop-sm text-paper' : 'bg-paper'}`}
              style={value === n ? { background: colors[n], color: n === 0 ? '#ffffff' : '#0A0A0A' } : {}}
              aria-label={`Score ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Module01;
