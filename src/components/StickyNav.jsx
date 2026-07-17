// Scroll progress bar + sticky module nav (desktop pills, mobile burger).
import React, { useState, useEffect } from 'react';
import Icon from './Icon.jsx';
import { NAV } from '../lib/constants.js';

const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const handle = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? h.scrollTop / max * 100 : 0);
    };
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink/10 pointer-events-none">
      <div
        className="h-full transition-[width] duration-100 ease-out"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #ef3333 0%, #ffd95c 35%, #a9e1c6 65%, #8baaff 100%)'
        }} />

    </div>);

};

const StickyNav = () => {
  const [active, setActive] = useState('module-01');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = () => {
      let cur = NAV[0].id;
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < 200) cur = n.id;
      }
      setActive(cur);
    };
    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <nav className="sticky top-1 z-40 bg-paper/90 nav-blur border-b-4 border-ink">
      <div className="px-4 md:px-8 lg:px-12 py-3 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-ink text-paper font-display text-sm">PB</span>
          <span className="font-display uppercase text-lg hidden sm:inline">Playbook · 01</span>
        </a>

        <div className="hidden md:flex items-center gap-2">
          {NAV.map((n) => {
            const isActive = active === n.id;
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={`border-ink-3 px-3 py-1.5 font-mono uppercase text-[11px] tracking-wider transition-all ${isActive ? 'shadow-pop-sm' : ''}`}
                style={{ background: isActive ? n.color : '#ffffff', color: '#0A0A0A' }}>

                {n.label}
              </a>);

          })}
        </div>

        <a href="#contact" onClick={(e) => {e.preventDefault();document.querySelector('footer').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });}}
        className="hidden md:inline-flex btn-pop border-ink-3 shadow-pop-sm bg-pop-red text-paper px-3 py-1.5 font-mono uppercase text-[11px] tracking-wider" style={{ backgroundColor: "rgb(239, 51, 51)" }}>
          Work with me
        </a>

        <button onClick={() => setOpen((o) => !o)} className="md:hidden border-ink-3 p-2" aria-label="Toggle menu">
          <Icon name={open ? 'x' : 'menu'} size={20} />
        </button>
      </div>
      {open &&
      <div className="md:hidden border-t-4 border-ink bg-paper px-4 py-3 grid grid-cols-2 gap-2">
          {NAV.map((n) =>
        <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)}
        className="border-ink-3 px-3 py-2 font-mono uppercase text-[11px]" style={{ background: n.color, color: '#0A0A0A' }}>
              {n.label}
            </a>
        )}
        </div>
      }
    </nav>);

};

export { ScrollProgress, StickyNav };
