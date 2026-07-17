// Shared primitives: Sticker, BurstBadge, PostageStamp, SectionTag, Card,
// MarqueeBar, Diamond, Dot, Spark
import React from 'react';

const Sticker = ({ children, color = '#ffd95c', rotate = -3, className = '', size = 'md' }) => {
  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base'
  };
  return (
    <span
      className={`inline-block font-mono font-bold uppercase tracking-wider border-ink-3 shadow-pop-sm ${sizes[size]} ${className}`}
      style={{ background: color, transform: `rotate(${rotate}deg)` }}>

      {children}
    </span>);

};

const BurstBadge = ({ children, color = '#ef3333', textColor = '#0A0A0A', size = 220, className = '', rotate = -4 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center text-center ${className}`}
      style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}>

      <div className="absolute inset-0 burst-44" style={{ background: '#0A0A0A' }} />
      <div className="absolute burst-44" style={{ inset: 5, background: color }} />
      <div className="relative z-10 px-6 font-display uppercase leading-none" style={{ color: textColor, fontSize: size * 0.13 }}>
        {children}
      </div>
    </div>);

};

const PostageStamp = ({ color = '#8baaff', rotate = 2, width = 250, padY = 18, className = '' }) => {
  const perf = 18,r = 7;
  const mask = [
  `radial-gradient(circle ${r}px at 50% 0,#0000 96%,#000) 0 0/${perf}px ${perf}px repeat-x`,
  `radial-gradient(circle ${r}px at 50% 100%,#0000 96%,#000) 0 100%/${perf}px ${perf}px repeat-x`,
  `radial-gradient(circle ${r}px at 0 50%,#0000 96%,#000) 0 0/${perf}px ${perf}px repeat-y`,
  `radial-gradient(circle ${r}px at 100% 50%,#0000 96%,#000) 100% 0/${perf}px ${perf}px repeat-y`,
  `linear-gradient(#000,#000) 50%/calc(100% - ${perf + 4}px) calc(100% - ${perf + 4}px) no-repeat`].
  join(',');
  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width, padding: 16, background: color, color: 'var(--c-ink)',
        transform: `rotate(${rotate}deg)`,
        filter: 'drop-shadow(7px 7px 0 var(--c-ink))',
        WebkitMask: mask, mask,
        WebkitMaskComposite: 'source-out', maskComposite: 'subtract'
      }}>
      <div className="text-center" style={{ border: '3px dashed var(--c-ink)', padding: `${padY}px 16px` }}>
        <div className="flex justify-between font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.2em', marginBottom: 10 }}>
          <span>Nº 01</span><span>AEO·GEO</span>
        </div>
        <div className="font-display uppercase" style={{ lineHeight: 0.9, fontSize: 25 }}>
          Make sure you get{' '}
          <em style={{ fontStyle: 'normal', background: 'var(--c-ink)', color, padding: '0 4px' }}>cited</em>
        </div>
      </div>
    </div>);

};

const SectionTag = ({ number, title, color = '#8baaff' }) =>
<div className="flex items-center gap-3 mb-4">
    <span
    className="inline-flex items-center justify-center w-12 h-12 border-ink-3 font-mono font-bold text-lg"
    style={{ background: color, color: 'var(--c-ink)' }}>

      {number}
    </span>
    <span className="font-mono uppercase text-xs tracking-[0.2em] text-ink/70">{title}</span>
  </div>;


const Card = ({ children, color = '#ffffff', className = '', tilt = 0, shadow = 'shadow-pop' }) =>
<div
  className={`border-ink-4 ${shadow} ${className}`}
  style={{ background: color, transform: tilt ? `rotate(${tilt}deg)` : undefined }}>

    {children}
  </div>;


const MarqueeBar = ({ items, color = '#0A0A0A', textColor = '#ffffff', speed = 38 }) => {
  const content =
  <div className="flex items-center gap-10 px-5 whitespace-nowrap">
      {items.map((it, i) =>
    <span key={i} className="flex items-center gap-10 font-display uppercase text-2xl">
          <span>{it}</span>
          <span aria-hidden className="inline-block w-3 h-3 rotate-45" style={{ background: '#ef3333' }} />
        </span>
    )}
    </div>;

  return (
    <div className="overflow-hidden border-y-4 border-ink py-3" style={{ background: color, color: textColor }}>
      <div className="flex marquee-track" style={{ animationDuration: `${speed}s` }}>
        {content}
        {content}
      </div>
    </div>);

};

// Diamond/star/blob accent SVGs (simple primitives only — squares/circles/rotated)
const Diamond = ({ size = 14, color = '#ef3333', className = '' }) =>
<span className={`inline-block ${className}`} style={{ width: size, height: size, background: color, transform: 'rotate(45deg)' }} />;


const Dot = ({ size = 10, color = '#0A0A0A', className = '' }) =>
<span className={`inline-block rounded-full ${className}`} style={{ width: size, height: size, background: color }} />;


// 4-point sparkle (simple SVG, allowed primitive)
const Spark = ({ size = 18, color = '#ef3333', className = '' }) =>
<svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={color} />
  </svg>;


export { Sticker, BurstBadge, PostageStamp, SectionTag, Card, MarqueeBar, Diamond, Dot, Spark };
