// "What's inside" — five colored cards linking to the modules.
import React from 'react';
import { Card } from './primitives.jsx';

const TableOfContents = () =>
<section id="toc" className="border-b-4 border-ink bg-paper">
    <div className="px-6 md:px-12 lg:px-20 py-16">
      <div className="flex items-end justify-between gap-6 flex-wrap mb-8">
        <div>
          <div className="font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60 mb-2">Table of contents</div>
          <h2 className="font-display uppercase text-5xl md:text-7xl leading-none">What's inside.</h2>
        </div>
        <div className="font-mono text-sm text-ink/60 max-w-sm">
          Five interactive modules. Build your verdict, copy the prompts, fix the gap. In that order.
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
      { n: '01', t: 'Opportunity Scorecard', s: 'Score five dimensions. Get a verdict.', c: '#ef3333', tc: '#ffffff', href: '#module-01' },
      { n: '02', t: 'Unified Workflow', s: 'Seven steps. One ritual. Monthly.', c: '#8baaff', tc: '#0A0A0A', href: '#module-02' },
      { n: '03', t: 'Perception Gap', s: 'Two columns. Click for pro-tips.', c: '#a9e1c6', tc: '#0A0A0A', href: '#module-03' },
      { n: '04', t: 'Share of Model', s: 'Run a live AI brand audit.', c: '#9f68ff', tc: '#0A0A0A', href: '#module-04' },
      { n: '05', t: 'Prompt Vault', s: 'Nine prompts. Copy. Run. Repeat.', c: '#ffd95c', tc: '#0A0A0A', href: '#module-05' }].
      map((item, i) =>
      <a key={item.n} href={item.href} className="block">
            <Card color={item.c} className="p-4 h-full btn-pop" tilt={i % 2 === 0 ? -1 : 1}>
              <div className="font-display text-6xl leading-none mb-3" style={{ color: item.tc }}>{item.n}</div>
              <div className="font-display uppercase text-xl leading-tight mb-2" style={{ color: item.tc }}>{item.t}</div>
              <div className="font-mono text-[11px] uppercase tracking-wider" style={{ color: item.tc, opacity: 0.8 }}>{item.s}</div>
            </Card>
          </a>
      )}
      </div>
    </div>
  </section>;


export default TableOfContents;
