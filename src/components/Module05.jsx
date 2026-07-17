// Module 05 — Prompt Vault: nine copy-ready probe prompts in three tabbed
// categories.
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { SectionTag, BurstBadge, Card } from './primitives.jsx';

const PROMPT_VAULT = {
  discovery: {
    label: 'Discovery',
    color: '#ffd95c',
    blurb: 'Find out what the models already think about your category.',
    prompts: [
      {
        title: 'Category default check',
        body: 'I\'m looking for a tool that does [JOB] for a [PERSONA] team of about 25 people. What are the three options I should evaluate first? Briefly explain why each one is worth a look.',
      },
      {
        title: 'Buyer journey unpack',
        body: 'I\'m a [TITLE] at a [STAGE] company in [VERTICAL]. Walk me through how I should think about choosing a [CATEGORY] vendor — what to evaluate first, what to evaluate second, and the trap most people fall into.',
      },
      {
        title: 'Hidden alternatives surface',
        body: 'Beyond the obvious leaders in [CATEGORY], who are the underrated players that a sophisticated buyer should consider? Why are they underrated?',
      },
    ],
  },
  narrative: {
    label: 'Narrative',
    color: '#a9e1c6',
    blurb: 'Test whether your story survives contact with a model.',
    prompts: [
      {
        title: 'Definition lift test',
        body: 'In one paragraph, define what [BRAND] does. Use language a non-technical buyer would understand. Then list the three things [BRAND] is best known for.',
      },
      {
        title: 'Positioning audit',
        body: 'How does [BRAND] position itself relative to [COMPETITOR]? Which positioning is more compelling to a [PERSONA], and why?',
      },
      {
        title: 'Origin story check',
        body: 'Why does [BRAND] exist? What problem did its founders see that the existing market wasn\'t solving? Cite a source if you can.',
      },
    ],
  },
  competitive: {
    label: 'Competitive',
    color: '#8baaff',
    textColor: '#0A0A0A',
    blurb: 'Probe how the models rank you against the people who keep you up at night.',
    prompts: [
      {
        title: 'Head-to-head ranking',
        body: 'Rank [BRAND], [COMPETITOR A], and [COMPETITOR B] for a [PERSONA] solving [JOB]. Justify the ranking with one strength and one weakness per option.',
      },
      {
        title: 'Switching cost probe',
        body: 'A [PERSONA] currently uses [COMPETITOR]. What\'s the strongest case for switching to [BRAND], and what\'s the strongest case for staying put?',
      },
      {
        title: 'Hidden weakness scan',
        body: 'What\'s the most common reason a customer would churn from [BRAND]? Be specific and cite recent reviews or discussions if available.',
      },
    ],
  },
};

const Module05 = () => {
  const [tab, setTab] = useState('discovery');
  const [copiedKey, setCopiedKey] = useState(null);
  const cur = PROMPT_VAULT[tab];

  const copy = async (key, text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1400);
  };

  return (
    <section id="module-05" className="border-b-4 border-ink" style={{ background: '#0A0A0A' }} data-screen-label="05 Prompt Vault">
      <div className="px-6 md:px-12 lg:px-20 py-20 text-paper">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-8">
            <SectionTag number="05" title="The Prompt Vault" color="#ffd95c" />
            <h2 className="font-display uppercase leading-[0.9] text-[clamp(40px,7vw,96px)]">
              Steal these.<br/>
              <span className="italic font-serif font-normal lowercase text-pop-yellow">run</span> them weekly.
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-paper/80">
              Nine prompts, three categories. Copy, fill the brackets, run them across every model
              you care about. Repeat on a calendar. Watch the shape of the answers move.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <BurstBadge color="#ffd95c" textColor="#0A0A0A" size={220} rotate={6}>
              Probe.<br/>Don't<br/>guess.
            </BurstBadge>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex flex-wrap gap-3 mb-6">
          {Object.entries(PROMPT_VAULT).map(([k, v]) => {
            const isActive = k === tab;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(k)}
                className={`btn-pop border-ink-4 px-5 py-3 font-display uppercase text-xl ${isActive ? 'shadow-pop-lg' : 'shadow-pop-sm opacity-90'}`}
                style={{
                  background: isActive ? v.color : '#ffffff',
                  color: isActive ? (v.textColor || '#0A0A0A') : '#0A0A0A',
                }}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        <p className="font-serif italic text-xl text-paper/70 mb-7 max-w-2xl">{cur.blurb}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cur.prompts.map((p, i) => {
            const key = `${tab}-${i}`;
            const copied = copiedKey === key;
            return (
              <Card key={key} color="#ffffff" className="p-4 text-ink flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60">Prompt {String(i+1).padStart(2,'0')}</span>
                  <span className="font-mono text-[10px] uppercase border-ink-3 px-2 py-0.5" style={{ background: cur.color, color: cur.textColor || '#0A0A0A' }}>{cur.label}</span>
                </div>
                <h3 className="font-display uppercase text-2xl leading-tight mb-3">{p.title}</h3>
                <pre className="flex-1 font-mono text-[13px] leading-relaxed whitespace-pre-wrap bg-ink/5 border-ink-3 p-3 mb-4 text-ink">{p.body}</pre>
                <button
                  onClick={() => copy(key, p.body)}
                  className="btn-pop inline-flex items-center justify-center gap-2 border-ink-3 shadow-pop-sm px-4 py-2 font-mono uppercase text-xs"
                  style={{ background: copied ? '#a9e1c6' : '#ffd95c' }}
                >
                  <Icon name={copied ? 'check' : 'copy'} size={14} />
                  {copied ? 'Copied to clipboard' : 'Copy prompt'}
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Module05;
