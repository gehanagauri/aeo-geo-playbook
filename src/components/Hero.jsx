// Masthead: utility strip, stickers, display headline, CTAs, postage stamp,
// and the blue marquee.
import React from 'react';
import Icon from './Icon.jsx';
import { Sticker, PostageStamp, MarqueeBar, Diamond, Spark } from './primitives.jsx';

const Hero = () => {
  return (
    <header className="relative overflow-hidden border-b-4 border-ink">
      {/* Top utility strip */}
      <div className="bg-ink text-paper px-6 py-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
        <span className="flex items-center gap-2"><Spark size={12} color="#ffd95c" /> Issue 01 / Field guide</span>
        <span className="hidden md:inline">Apr 2026 · Independent edition</span>
        <span className="flex items-center gap-2">Ship. Measure. Iterate. <Spark size={12} color="#a9e1c6" /></span>
      </div>

      <div className="relative px-6 md:px-12 lg:px-20 pt-14 pb-20 paper-tex">
        {/* Floating accents */}
        <div className="hidden xl:block absolute top-6 right-12 rotate-12">
          <Sticker color="#a9e1c6" rotate={8} size="lg">Read time · 22 min</Sticker>
        </div>
        <div className="hidden lg:block absolute bottom-10 left-10">
          <Diamond size={28} color="#ef3333" />
        </div>

        <div className="max-w-6xl">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Sticker color="#ffd95c" rotate={-3}>The Field Guide</Sticker>
            <Sticker color="#FFB5C5" rotate={2}>Vol. 01 · AEO + GEO</Sticker>
            <Sticker color="#8baaff" rotate={-2} className="text-ink">For operators, not theorists</Sticker>
          </div>

          <h1 className="font-display uppercase leading-[0.85] tracking-tight text-[clamp(56px,11vw,180px)]" style={{ color: "rgb(10, 10, 10)" }}>
            How to be<br />
            <span className="relative inline-block">
              <span className="relative z-10">found</span>
              <span aria-hidden className="absolute left-0 right-0 bottom-2 h-5 md:h-7" style={{ background: '#ffd95c' }} />
            </span>{' '}
            <span className="italic font-serif font-normal lowercase">by</span><br />
            the machines.
          </h1>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7">
              <p className="text-xl md:text-2xl leading-snug max-w-2xl text-balance">
                A working playbook for <span className="bg-pop-mint px-1">Answer Engine Optimization</span> and{' '}
                <span className="bg-pop-pink px-1">Generative Engine Optimization</span>. Five interactive modules.
                One uncomfortable truth: if the models can't see you, you don't exist.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#module-01" className="btn-pop inline-flex items-center gap-2 border-ink-4 shadow-pop bg-pop-red text-paper px-5 py-3 font-mono uppercase text-sm font-bold" style={{ backgroundColor: "rgb(239, 51, 51)" }}>
                  Start with the scorecard
                  <Icon name="arrow-right" size={18} />
                </a>
                <a href="#toc" className="btn-pop inline-flex items-center gap-2 border-ink-4 shadow-pop bg-paper px-5 py-3 font-mono uppercase text-sm font-bold">
                  Table of contents
                </a>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="lg:-translate-y-1">
                <PostageStamp color="#8baaff" width={272} rotate={0} padY={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <MarqueeBar
        color="#8baaff"
        textColor="#0A0A0A"
        items={[
        'AEO = directness',
        'GEO = narrative',
        'The cost of inaction is invisibility',
        'Feed the models',
        'Anchor the statistic',
        'Lead with the definition',
        'Ship the playbook']
        } />

    </header>);

};

export default Hero;
