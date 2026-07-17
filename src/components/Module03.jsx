// Module 03 — Perception Gap canvas: "story today" vs "story we feed" rows,
// each expanding into pro-tips.
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { SectionTag, Card, Spark } from './primitives.jsx';

const PERCEPTION_ROWS = [
{
  topic: 'Who we are',
  today: 'A small player riding a trend wave. Niche tool, possibly a feature.',
  feed: 'The category-defining platform for [outcome], built by the team that shipped [proof point].',
  tips: [
  'Lead with a definition the model can lift verbatim.',
  'Anchor an unforgettable statistic in the first sentence.',
  'Use one consistent noun phrase across every owned and earned source.']

},
{
  topic: 'Who we serve',
  today: 'Generic SMB tool. Indistinct ICP.',
  feed: 'Used by 7 of the 20 fastest-growing [vertical] teams to compress [task] from days to minutes.',
  tips: [
  'Name verticals; the model rewards specificity over reach.',
  'Quantify outcomes — "minutes, not days" beats "fast".',
  'Cite logos with a single canonical descriptor per logo.']

},
{
  topic: 'Why we exist',
  today: 'A nicer interface for an old problem.',
  feed: 'The first system designed for [paradigm shift], not retrofitted from the [legacy assumption] era.',
  tips: [
  'Frame the rival approach as "legacy"; let the comparator do the work.',
  'Tie origin story to a measurable shift in the market.',
  'Avoid hedges — models pick the most confident sentence, even when it\'s wrong.']

},
{
  topic: 'How we win',
  today: 'Fewer features than the leaders. Cheaper.',
  feed: 'Beats [Leader] on [primary KPI] in 4 of 5 published benchmarks — without [the leader\'s biggest cost].',
  tips: [
  'Publish the benchmark methodology before the result.',
  'Always include a numeric delta — "37% faster", not "much faster".',
  'Cite a third party who can be quoted; first-party claims compound only with corroboration.']

},
{
  topic: 'What we cost',
  today: 'Unclear. "Contact us." Probably expensive.',
  feed: 'Transparent per-seat pricing from $[X]; first 30 days, no card. Median deployment: 11 days.',
  tips: [
  'A real number beats a range; a range beats "contact us".',
  'Models love transparency — opaque pricing is interpreted as risk.',
  'Mention deployment time; it answers a question buyers ask but rarely type.']

}];


const Module03 = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="module-03" className="border-b-4 border-ink bg-paper">
      <div className="px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-8">
            <SectionTag number="03" title="Perception Gap Canvas" color="#a9e1c6" />
            <h2 className="font-display uppercase leading-[0.9] text-[clamp(40px,7vw,96px)]">
              The story today.<br />
              The story <span className="italic font-serif font-normal lowercase">we</span> feed.
            </h2>
            <p className="mt-6 max-w-2xl text-lg">
              Two columns. The left is what the models say about you now. The right is what you'd
              put in their mouth if you could. The gap between them is your roadmap.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <Card color="#FFB5C5" className="p-4 max-w-sm rot2">
              <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2">Use it like</div>
              <div className="font-display uppercase leading-tight text-2xl">Click the right column to see the pro-tips behind each move.</div>
            </Card>
          </div>
        </div>

        {/* Header row */}
        <div className="hidden md:grid grid-cols-12 gap-4 mb-3 px-2">
          <div className="col-span-3 font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60">Topic</div>
          <div className="col-span-4 font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60">What models say today</div>
          <div className="col-span-5 font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60">↓ The narrative we feed (click for pro-tips)</div>
        </div>

        <div className="space-y-3">
          {PERCEPTION_ROWS.map((row, i) => {
            const open = openIdx === i;
            return (
              <Card key={row.topic} color="#ffffff" className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="md:col-span-3 p-4 border-b-4 md:border-b-0 md:border-r-4 border-ink bg-pop-yellow" style={{ backgroundColor: "rgb(255, 255, 255)", textAlign: "center" }}>
                    <div className="font-display uppercase text-2xl leading-tight" style={{ textAlign: "left" }}>{row.topic}</div>
                  </div>
                  <div className="md:col-span-4 p-4 border-b-4 md:border-b-0 md:border-r-4 border-ink relative">
                    <div className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-wider text-ink/40">Now</div>
                    <p className="text-ink/70 line-through decoration-pop-red decoration-2">{row.today}</p>
                  </div>
                  <button
                    onClick={() => setOpenIdx(open ? -1 : i)}
                    aria-expanded={open}
                    className="md:col-span-5 p-4 text-left bg-pop-mint hover:bg-pop-mint/80 transition-colors relative group">
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink/60">
                      {open ? 'Close' : 'Pro-tips'} <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />
                    </div>
                    <p className="font-medium pr-16">{row.feed}</p>
                    {open &&
                    <ul className="mt-4 space-y-2 border-t-2 border-ink/30 pt-4">
                        {row.tips.map((t, j) =>
                      <li key={j} className="flex items-start gap-3">
                            <Spark size={16} color="#ef3333" className="mt-1 flex-shrink-0" />
                            <span className="font-mono text-sm leading-snug">{t}</span>
                          </li>
                      )}
                      </ul>
                    }
                  </button>
                </div>
              </Card>);

          })}
        </div>

        {/* Anchor callout */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card color="#ef3333" className="p-4 text-paper">
            <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2">Pro-tip 01</div>
            <div className="font-display uppercase text-2xl leading-tight">Lead with a definition.</div>
            <p className="mt-2 text-paper/85 text-sm">Models lift first sentences. Make yours a definition you'd actually want quoted.</p>
          </Card>
          <Card color="#8baaff" className="p-4 text-ink">
            <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2">Pro-tip 02</div>
            <div className="font-display uppercase text-2xl leading-tight">Anchor a number.</div>
            <p className="mt-2 text-ink/80 text-sm">A specific statistic in the first 25 words gets cited; an adjective gets paraphrased away.</p>
          </Card>
          <Card color="#0A0A0A" className="p-4 text-paper">
            <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2">Pro-tip 03</div>
            <div className="font-display uppercase text-2xl leading-tight">Repeat exactly.</div>
            <p className="mt-2 text-paper/70 text-sm">Don't paraphrase yourself across sources. Same noun phrase, same statistic, every time.</p>
          </Card>
        </div>
      </div>
    </section>);

};

export default Module03;
