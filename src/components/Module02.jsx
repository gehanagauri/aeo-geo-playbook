// Module 02 — Triple-Play workflow: Probe/Patch/Persist phase tabs over the
// seven-step loop, with a sticky detail panel.
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { SectionTag, Card } from './primitives.jsx';

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: 'Map the question landscape',
    short: 'List the questions a buyer types — not your keywords.',
    how: 'Sit with sales for an hour. Write the verbatim questions prospects ask in week one. Add the questions they\'re embarrassed to ask aloud. Now write the questions a model would invent on their behalf. Three columns. That is your search universe.',
    deliverable: 'A flat .csv: question, intent, persona, urgency.',
  },
  {
    id: 2,
    title: 'Run the unified probe',
    short: 'Same prompt, every surface, same week.',
    how: 'Run each question through Google, ChatGPT, Perplexity, Claude, and one vertical engine. Capture the answer verbatim, the citations, and the position you appear in (or don\'t). One spreadsheet. Tabs by surface.',
    deliverable: 'Probe matrix v1 — questions × surfaces × outcome.',
  },
  {
    id: 3,
    title: 'Diagnose the gap',
    short: 'Where the answer exists without you, ask why.',
    how: 'For every row where you\'re absent or misrepresented, label the cause: missing source, weak source, wrong narrative, stale data, or no answer at all. Don\'t skip this — it determines the fix.',
    deliverable: 'Gap log with one of five tags per question.',
  },
  {
    id: 4,
    title: 'Write the canonical answer',
    short: 'One paragraph the model can lift verbatim.',
    how: 'For each gap, write a 90-word definition-led paragraph. Lead with the term. Anchor a number. End with a comparator. This is the unit of GEO content; everything else is connective tissue.',
    deliverable: 'Answer block library, owned in version control.',
  },
  {
    id: 5,
    title: 'Place the proof',
    short: 'Get the paragraph onto sources the models trust.',
    how: 'Rank your domains by crawl frequency. Push answer blocks to your highest-authority owned property first, then to two third-party sources within thirty days. Do not paraphrase across sources — repeat exactly. Models reward consistency.',
    deliverable: 'Distribution checklist per answer block.',
  },
  {
    id: 6,
    title: 'Re-probe & measure delta',
    short: 'Same prompts. Six weeks later. Score the change.',
    how: 'Re-run the probe matrix on a calendar reminder. Compare verbatim. Track three metrics: presence, sentiment, and citation rank. Anything that didn\'t move is a content problem; anything that moved against you is a competitive one.',
    deliverable: 'Delta report. Stand-up agenda for the team.',
  },
  {
    id: 7,
    title: 'Industrialize the loop',
    short: 'Make it boring. Make it monthly.',
    how: 'Bake the probe into a monthly ritual owned by one person, with a fixed template, fixed questions, and a fixed publishing cadence. The teams that win at AEO are the ones who treat it like reporting, not a campaign.',
    deliverable: 'A calendar invite. A doc owner. A budget line.',
  },
];

const TRIPLE_PLAY = [
  {
    key: 'probe',
    label: 'Probe',
    tagline: 'See what the models actually say.',
    color: '#ffd95c',
    textColor: '#0A0A0A',
    accent: '#ef3333',
    stepIds: [1, 2],
  },
  {
    key: 'patch',
    label: 'Patch',
    tagline: 'Diagnose the gap. Write the fix. Place it.',
    color: '#ef3333',
    textColor: '#ffffff',
    accent: '#ffd95c',
    stepIds: [3, 4, 5],
  },
  {
    key: 'persist',
    label: 'Persist',
    tagline: 'Measure the delta. Make it monthly.',
    color: '#a9e1c6',
    textColor: '#0A0A0A',
    accent: '#0A0A0A',
    stepIds: [6, 7],
  },
];

const Module02 = () => {
  const [phase, setPhase] = useState('probe');
  const [activeStep, setActiveStep] = useState({ probe: 1, patch: 3, persist: 6 });

  const cur = TRIPLE_PLAY.find(p => p.key === phase);
  const phaseSteps = cur.stepIds.map(id => WORKFLOW_STEPS.find(s => s.id === id));
  const step = WORKFLOW_STEPS.find(s => s.id === activeStep[phase]);
  const phaseIndex = TRIPLE_PLAY.findIndex(p => p.key === phase);

  return (
    <section id="module-02" className="border-b-4 border-ink" style={{ background: '#8baaff' }}>
      <div className="px-6 md:px-12 lg:px-20 py-20 text-ink">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-8">
            <SectionTag number="02" title="The Triple-Play Framework" color="#ef3333" />
            <h2 className="font-display uppercase leading-[0.9] text-[clamp(40px,7vw,96px)]">
              Probe. Patch.<br/>
              <span className="italic font-serif font-normal lowercase">then</span> persist.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink/80">
              Stop optimizing for one engine at a time. The teams that win across Google, ChatGPT,
              Perplexity, and the next thing run a single workflow on a tight loop — three phases,
              seven steps, owned by one person.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <Card color="#ffd95c" className="p-4 max-w-sm rot-2">
              <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2 text-ink">Time per loop</div>
              <div className="font-display uppercase leading-tight text-2xl text-ink">≈ 3 days, monthly. Owned by one person, no exceptions.</div>
            </Card>
          </div>
        </div>

        {/* Triple-Play tab strip */}
        <div role="tablist" aria-label="Triple-Play phases" className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          {TRIPLE_PLAY.map((p, i) => {
            const isActive = p.key === phase;
            return (
              <button
                key={p.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setPhase(p.key)}
                className={`btn-pop border-ink-4 text-left p-4 md:p-5 transition-all ${isActive ? 'shadow-pop-lg' : 'shadow-pop-sm opacity-95'}`}
                style={{
                  background: isActive ? p.color : '#ffffff',
                  color: isActive ? p.textColor : '#0A0A0A',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-mono uppercase text-[11px] tracking-[0.2em] opacity-70">Phase 0{i+1}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">{p.stepIds.length} steps</span>
                </div>
                <div className="font-display uppercase text-4xl md:text-5xl leading-none mb-2">{p.label}.</div>
                <div className="font-serif italic text-base md:text-lg leading-snug opacity-90">{p.tagline}</div>
              </button>
            );
          })}
        </div>

        {/* Phase progress dots */}
        <div className="flex items-center gap-2 mb-6">
          {TRIPLE_PLAY.map((p, i) => (
            <React.Fragment key={p.key}>
              <span
                className="w-3 h-3 border-2 border-ink"
                style={{ background: i <= phaseIndex ? p.color : 'transparent' }}
              />
              {i < TRIPLE_PLAY.length - 1 && <span className="flex-1 h-0.5 bg-ink/20 max-w-12" />}
            </React.Fragment>
          ))}
          <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/70">
            Phase {phaseIndex + 1} of {TRIPLE_PLAY.length} — {cur.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sub-step list within current phase */}
          <ol className="lg:col-span-5 space-y-3">
            {phaseSteps.map((s) => {
              const isActive = s.id === activeStep[phase];
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveStep(prev => ({ ...prev, [phase]: s.id }))}
                    className={`w-full text-left border-ink-4 p-4 flex items-start gap-4 transition-all ${isActive ? 'shadow-pop-lg' : 'shadow-pop-sm'}`}
                    style={{ background: isActive ? cur.color : '#ffffff' }}
                  >
                    <span className="font-display text-3xl leading-none w-10 flex-shrink-0 text-ink">
                      {String(s.id).padStart(2, '0')}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-display uppercase text-xl leading-tight text-ink">{s.title}</span>
                      <span className="block mt-1 font-mono text-[11px] uppercase tracking-wider text-ink/70">{s.short}</span>
                    </span>
                    <span className="flex-shrink-0 mt-1">
                      <Icon name={isActive ? 'arrow-right' : 'circle'} size={20} className="text-ink" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Detail panel */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <Card color="#ffffff" className="p-5 md:p-7 text-ink relative overflow-hidden">
                <div className="absolute top-0 right-0 halftone w-40 h-40 opacity-20" />
                <div className="flex items-center gap-3 mb-4 relative flex-wrap">
                  <span
                    className="inline-flex items-center justify-center w-10 h-10 border-ink-3 font-display text-xl"
                    style={{ background: cur.color, color: cur.textColor }}
                  >
                    {String(step.id).padStart(2, '0')}
                  </span>
                  <span className="font-mono uppercase text-[11px] tracking-[0.2em]">
                    {cur.label} · Step {step.id} of {WORKFLOW_STEPS.length}
                  </span>
                </div>
                <h3 className="font-display uppercase text-4xl md:text-5xl leading-none mb-3">{step.title}</h3>
                <p className="font-serif italic text-xl mb-5 text-ink/80">{step.short}</p>
                <p className="text-lg leading-snug mb-6 max-w-prose">{step.how}</p>

                <div className="border-t-2 border-ink/20 pt-4 flex flex-wrap items-center gap-3">
                  <span className="font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60">Deliverable</span>
                  <span className="font-mono text-sm border-ink-3 px-3 py-1 bg-pop-mint">{step.deliverable}</span>
                </div>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const idx = phaseSteps.findIndex(s => s.id === activeStep[phase]);
                      if (idx > 0) {
                        setActiveStep(prev => ({ ...prev, [phase]: phaseSteps[idx - 1].id }));
                      } else if (phaseIndex > 0) {
                        const prevPhase = TRIPLE_PLAY[phaseIndex - 1];
                        setPhase(prevPhase.key);
                        setActiveStep(prev => ({ ...prev, [prevPhase.key]: prevPhase.stepIds[prevPhase.stepIds.length - 1] }));
                      }
                    }}
                    disabled={phaseIndex === 0 && phaseSteps[0].id === activeStep[phase]}
                    className="btn-pop inline-flex items-center gap-2 border-ink-3 shadow-pop-sm bg-paper px-4 py-2 font-mono uppercase text-xs disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Icon name="arrow-left" size={16} /> Prev
                  </button>
                  <div className="flex gap-1.5">
                    {WORKFLOW_STEPS.map(s => {
                      const owningPhase = TRIPLE_PLAY.find(tp => tp.stepIds.includes(s.id));
                      const isCurrent = s.id === activeStep[phase] && phase === owningPhase.key;
                      const isCovered = TRIPLE_PLAY.findIndex(tp => tp.key === owningPhase.key) <= phaseIndex;
                      return (
                        <span
                          key={s.id}
                          className="w-2.5 h-2.5 border border-ink"
                          style={{ background: isCurrent ? owningPhase.color : isCovered ? owningPhase.color + '80' : 'transparent' }}
                        />
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const idx = phaseSteps.findIndex(s => s.id === activeStep[phase]);
                      if (idx < phaseSteps.length - 1) {
                        setActiveStep(prev => ({ ...prev, [phase]: phaseSteps[idx + 1].id }));
                      } else if (phaseIndex < TRIPLE_PLAY.length - 1) {
                        const nextPhase = TRIPLE_PLAY[phaseIndex + 1];
                        setPhase(nextPhase.key);
                      }
                    }}
                    disabled={phaseIndex === TRIPLE_PLAY.length - 1 && phaseSteps[phaseSteps.length - 1].id === activeStep[phase]}
                    className="btn-pop inline-flex items-center gap-2 border-ink-3 shadow-pop-sm bg-pop-yellow px-4 py-2 font-mono uppercase text-xs disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next <Icon name="arrow-right" size={16} />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Module02;
