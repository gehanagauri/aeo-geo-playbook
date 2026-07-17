// Footer — contact marquee, email copy card, services card, colophon strip.
import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { MarqueeBar, Card, Diamond, Spark } from './primitives.jsx';

const Footer = () => {
  const [copied, setCopied] = useState(false);
  const email = 'gehanagauri@gmail.com';
  const copy = async () => {
    try { await navigator.clipboard.writeText(email); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <footer className="bg-paper border-t-4 border-ink">
      <MarqueeBar
        color="#ef3333"
        textColor="#0A0A0A"
        items={['Work with me', 'Brief in, playbook out', 'AEO · GEO · narrative ops', 'Available Q3', 'Send a paragraph', 'Skip the deck']}
      />
      <div className="px-6 md:px-12 lg:px-20 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-3 text-ink/60">Contact</div>
          <h2 className="font-display uppercase leading-[0.9] text-[clamp(40px,8vw,120px)]">
            Work<br/>
            <span className="italic font-serif font-normal lowercase">with</span> me.
          </h2>
          <p className="mt-5 max-w-xl text-lg">
            I help teams move from invisible to defended. Send a paragraph about where you are
            and where you want to be.
          </p>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Card color="#ffd95c" className="p-4">
            <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2">Email</div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <a href={`mailto:${email}`} className="font-display uppercase text-2xl leading-tight break-all hover:underline">{email}</a>
              <button
                onClick={copy}
                className="btn-pop inline-flex items-center gap-2 border-ink-3 shadow-pop-sm bg-paper px-3 py-2 font-mono uppercase text-[11px]"
              >
                <Icon name={copied ? 'check' : 'copy'} size={14} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </Card>
          <Card color="#8baaff" className="p-4 text-ink">
            <div className="font-mono uppercase text-[11px] tracking-[0.2em] mb-2">Best for</div>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2"><Diamond size={10} color="#ffd95c" /> AEO/GEO audits & roadmaps</li>
              <li className="flex items-center gap-2"><Diamond size={10} color="#ffd95c" /> Narrative ops for B2B teams</li>
              <li className="flex items-center gap-2"><Diamond size={10} color="#ffd95c" /> Probe rituals & content systems</li>
            </ul>
          </Card>
        </div>
      </div>
      <div className="border-t-4 border-ink bg-ink text-paper px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] flex-wrap gap-2">
        <span>© 2026 · The AEO/GEO Playbook · Vol. 01</span>
        <span className="flex items-center gap-2">Hand-set in Archivo, Space Grotesk & Fraunces <Spark size={12} color="#ffd95c" /></span>
      </div>
    </footer>
  );
};

export default Footer;
