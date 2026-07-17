// "The shift" mint callout — why AEO/GEO matters, sets up the modules.
import React from 'react';
import { Card } from './primitives.jsx';

const WhyCallout = () =>
<section className="border-b-4 border-ink bg-paper">
    <div className="px-6 md:px-12 lg:px-20 py-16">
      <Card color="#a9e1c6" className="p-6 md:p-10">
        <div className="font-mono uppercase text-[11px] tracking-[0.2em] text-ink/60 mb-4">The shift</div>
        <h2 className="font-display uppercase leading-[0.95] text-[clamp(30px,4.5vw,56px)] mb-6">
          The SERP is collapsing into a sentence.
        </h2>
        <p className="text-lg md:text-xl leading-snug max-w-3xl text-balance">
          For twenty years, search returned ten blue links and let the buyer choose. Answer engines
          don't. They retrieve from an indexed corpus, synthesize one response, and cite a handful of
          sources — or none. The ten-link shelf where you used to rank is becoming a single paragraph
          you're either <em className="font-serif italic font-normal">in</em> or absent from. This is{' '}
          <em className="font-serif italic font-normal">retrieval-augmented generation</em>: the model
          doesn't recall you, it <em className="font-serif italic font-normal">retrieves</em> you. Which
          means visibility is a retrieval problem before it's a content problem. The five modules below
          are how you solve it.
        </p>
      </Card>
    </div>
  </section>;


export default WhyCallout;
