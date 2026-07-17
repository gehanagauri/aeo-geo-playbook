// Module 04 — Share of Model: the live audit tool. Three stages (brands →
// prompts → run/read) driving parallel model calls, with leaderboard,
// per-prompt breakdown, insights, and CSV/report export.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SOM_VAULT } from '../lib/prompts.js';
import { somAskModel, somSplitMeta, somParseSentiment, somMentions, somFirstBrand } from '../lib/som.js';

// Share of Model — Module 04
// Drop-in section between Perception Canvas (M03) and Prompt Vault (M05).
// Pop-art aesthetic, all classes prefixed `som-` to avoid collisions.


const MEASURE_NOTE = {
  share: 'Share of Model — how often each brand surfaces in the answers, across every query.',
  first: 'First-mention rate — how often each brand is the one named first. The default the model reaches for.',
  sentiment: 'Favorability — of the times a brand was named, how often the tone was positive.'
};

// Simple hand-drawn pointer (up-and-right). Decorative only.
const SomArrow = ({ w = 54, h = 40 }) =>
<svg width={w} height={h} viewBox="0 0 54 40" aria-hidden="true">
    <path d="M10 36 C 2 20, 16 8, 46 6" fill="none" stroke="#ee5530" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M35 5 L49 4 L44 17" fill="none" stroke="#ee5530" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;


const SOM_STYLES = `
.som-section,.som-section *{box-sizing:border-box}
.som-section{
  --som-cream:#f5f1e3;--som-cream-2:#ece6d2;--som-ink:#0a0a0a;--som-paper:#fff;
  --som-yellow:#f5d547;--som-pink:#f9c2cc;--som-blue:#4f7df0;--som-mint:#8de4c0;
  --som-coral:#ee5530;--som-coral-d:#d63d1a;
  --som-mint-soft:#b8eed4;--som-pink-soft:#fcd9df;--som-yellow-mark:#fce97a;
  --som-rule:#0a0a0a;--som-line:rgba(10,10,10,0.12);--som-mute:#5a544a;
  --som-sans:'Archivo','Space Grotesk',system-ui,sans-serif;
  --som-serif:'Fraunces',Georgia,serif;
  --som-mono:'JetBrains Mono',ui-monospace,monospace;
  --som-shadow:4px 4px 0 0 var(--som-ink);
  --som-shadow-lg:6px 6px 0 0 var(--som-ink);
  background:var(--som-paper);font-family:var(--som-sans);color:var(--som-ink);
  padding:80px 40px 100px;position:relative;overflow:hidden;border-top:4px solid var(--som-ink);border-bottom:4px solid var(--som-ink);
}
.som-section::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(10,10,10,0.08) 1px,transparent 1px);background-size:24px 24px;pointer-events:none;z-index:0}
.som-wrap{max-width:1180px;margin:0 auto;position:relative;z-index:1}
.som-marquee{background:var(--som-ink);color:var(--som-cream);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;margin:-80px -40px 60px;font-family:var(--som-mono);font-size:12px;letter-spacing:0.16em;text-transform:uppercase;font-weight:600;position:relative;z-index:2}
.som-marquee .star{color:var(--som-yellow);margin:0 14px;font-size:14px}
.som-marquee .center{display:flex;align-items:center}
.som-header{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:start;margin-bottom:56px}
.som-header-left{min-width:0}
.som-pill-row{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:36px}
.som-tag-pill{display:inline-flex;align-items:center;padding:10px 22px;border:2px solid var(--som-ink);border-radius:100px;font-family:var(--som-mono);font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;box-shadow:var(--som-shadow);transform:rotate(-1.5deg)}
.som-tag-pill:nth-child(2){transform:rotate(1deg)}
.som-tag-pill:nth-child(3){transform:rotate(-0.5deg)}
.som-tag-pill.yellow{background:var(--som-yellow)}.som-tag-pill.pink{background:var(--som-pink)}.som-tag-pill.blue{background:var(--som-blue);color:#fff}.som-tag-pill.mint{background:var(--som-mint)}
.som-headline{font-family:var(--som-sans);font-weight:800;font-size:clamp(54px,8vw,116px);line-height:0.92;letter-spacing:-0.035em;color:var(--som-ink);margin:0 0 36px;text-transform:uppercase}
.som-headline em{font-family:var(--som-serif);font-style:italic;font-weight:400;text-transform:lowercase;letter-spacing:-0.01em;padding:0 8px}
.som-mark-yellow{background:var(--som-yellow-mark);padding:0 0.06em;box-shadow:0 -0.05em 0 var(--som-yellow-mark) inset,0 -0.45em 0 var(--som-yellow-mark) inset}
.som-deck{font-family:var(--som-sans);font-size:clamp(17px,1.5vw,21px);font-weight:500;line-height:1.45;max-width:660px;margin-bottom:40px;color:var(--som-ink)}
.som-deck .mark-mint{background:var(--som-mint-soft);padding:1px 6px}
.som-deck .mark-pink{background:var(--som-pink-soft);padding:1px 6px}
.som-burst{position:relative;width:236px;height:200px;flex-shrink:0;display:grid;place-items:center;text-align:center;padding:26px 24px;margin-top:-4px;transform:rotate(-2deg)}
.som-burst .som-brk{position:absolute;width:36px;height:36px;border:5px solid var(--som-ink)}
.som-burst .som-brk.tl{top:0;left:0;border-right:0;border-bottom:0}
.som-burst .som-brk.tr{top:0;right:0;border-left:0;border-bottom:0}
.som-burst .som-brk.bl{bottom:0;left:0;border-right:0;border-top:0}
.som-burst .som-brk.br{bottom:0;right:0;border-left:0;border-top:0}
.som-burst-lab{font-family:var(--som-mono);font-size:10px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:var(--som-coral);margin-bottom:10px}
.som-burst-text{position:relative;z-index:1;font-family:var(--som-sans);font-weight:800;font-size:34px;text-transform:uppercase;letter-spacing:-0.02em;text-align:center;line-height:0.88;color:var(--som-ink)}
.som-burst-text mark{background:var(--som-mint);color:var(--som-ink);padding:0 4px}
.som-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:14px 26px;border:2.5px solid var(--som-ink);border-radius:100px;font-family:var(--som-sans);font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;background:var(--som-paper);color:var(--som-ink);box-shadow:var(--som-shadow);transition:transform .12s,box-shadow .12s;white-space:nowrap;font-variant-numeric:tabular-nums}
.som-btn:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 0 var(--som-ink)}
.som-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 0 var(--som-ink)}
.som-btn.coral{background:var(--som-coral);color:#fff}.som-btn.coral:hover{background:var(--som-coral-d)}
.som-btn.yellow{background:var(--som-yellow)}.som-btn.mint{background:var(--som-mint)}.som-btn.blue{background:var(--som-blue);color:#fff}
.som-btn.ghost{background:transparent}
.som-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;box-shadow:var(--som-shadow)!important}
.som-btn.small{padding:10px 18px;font-size:12px}.som-btn.full{width:100%}
.som-stages{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:40px}
.som-stage-tab{background:var(--som-paper);border:2.5px solid var(--som-ink);border-radius:14px;padding:18px 22px;cursor:pointer;text-align:left;font-family:var(--som-sans);box-shadow:var(--som-shadow);transition:transform .12s,box-shadow .12s,background .12s;position:relative}
.som-stage-tab:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 0 var(--som-ink)}
.som-stage-tab.active{background:var(--som-yellow)}
.som-stage-tab.done{background:var(--som-mint)}
.som-stage-tab.active.done{background:var(--som-yellow)}
.som-stage-num{font-family:var(--som-mono);font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between}
.som-stage-num .check{font-size:14px;display:none}
.som-stage-tab.done .som-stage-num .check{display:inline}
.som-stage-name{font-weight:800;font-size:22px;letter-spacing:-0.02em;text-transform:uppercase}
.som-stage{display:none;animation:somFade .3s ease}
.som-stage.active{display:block}
@keyframes somFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.som-card{background:var(--som-paper);border:2.5px solid var(--som-ink);border-radius:16px;padding:32px 36px;box-shadow:var(--som-shadow-lg);margin-bottom:24px}
.som-card-title{font-family:var(--som-sans);font-weight:800;font-size:32px;letter-spacing:-0.025em;text-transform:uppercase;margin-bottom:8px;line-height:1.05}
.som-card-title em{font-family:var(--som-serif);font-style:italic;font-weight:400;text-transform:lowercase;letter-spacing:-0.01em}
.som-card-sub{font-size:15px;color:var(--som-mute);margin-bottom:28px;font-weight:500;max-width:600px;line-height:1.5}
.som-field{margin-bottom:22px}
.som-field-row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.som-label{display:block;font-family:var(--som-mono);font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:8px;color:var(--som-ink)}
.som-label .opt{color:var(--som-mute);font-weight:500;text-transform:none;letter-spacing:0;font-family:var(--som-serif);font-style:italic;font-size:13px;margin-left:6px}
.som-label .req{color:var(--som-coral);margin-left:2px}
.som-input,.som-select{width:100%;background:var(--som-cream);border:2px solid var(--som-ink);border-radius:10px;padding:14px 18px;font-size:15px;font-family:var(--som-sans);font-weight:500;color:var(--som-ink);outline:none;transition:background .15s}
.som-input::placeholder{color:var(--som-mute);font-weight:400}
.som-input:focus,.som-select:focus{background:color-mix(in srgb,var(--som-yellow) 30%,var(--som-cream))}
.som-add-row{display:flex;gap:10px}.som-add-row .som-input{flex:1}
.som-pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.som-pill{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:2px solid var(--som-ink);border-radius:100px;font-family:var(--som-sans);font-size:14px;font-weight:600;background:var(--som-pink);box-shadow:3px 3px 0 0 var(--som-ink)}
.som-pill:nth-child(3n){background:var(--som-mint)}
.som-pill:nth-child(3n+1){background:var(--som-blue);color:#fff}
.som-pill:nth-child(3n+2){background:var(--som-pink)}
.som-pill .x{background:none;border:none;cursor:pointer;font-size:16px;line-height:1;padding:0 0 0 4px;color:inherit;font-weight:700}
.som-prompt-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:8px}
.som-prompt-card{background:var(--som-cream);border:2px solid var(--som-ink);border-radius:12px;padding:16px 18px;cursor:pointer;text-align:left;font-family:var(--som-sans);transition:transform .12s,box-shadow .12s,background .12s;position:relative}
.som-prompt-card:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 0 var(--som-ink);background:var(--som-paper)}
.som-prompt-card.selected{background:var(--som-yellow);box-shadow:4px 4px 0 0 var(--som-ink)}
.som-prompt-type{font-family:var(--som-mono);font-size:9.5px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:6px;display:inline-block;padding:2px 8px;background:var(--som-ink);color:var(--som-cream);border-radius:100px}
.som-prompt-card.selected .som-prompt-type{background:var(--som-coral);color:#fff}
.som-prompt-text{font-size:14px;font-weight:500;line-height:1.4;color:var(--som-ink)}
.som-selected-list{margin-top:28px;padding-top:28px;border-top:2px dashed var(--som-ink)}
.som-selected-item{display:grid;grid-template-columns:32px 1fr 32px;gap:14px;align-items:center;padding:14px 18px;background:var(--som-cream);border:2px solid var(--som-ink);border-radius:10px;margin-bottom:8px;box-shadow:3px 3px 0 0 var(--som-ink)}
.som-selected-item .num{font-family:var(--som-mono);font-weight:700;font-size:12px;background:var(--som-coral);color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--som-ink)}
.som-selected-item .text{font-size:14px;font-weight:500}
.som-selected-item button{background:none;border:none;font-size:18px;cursor:pointer;color:var(--som-ink);padding:0;font-weight:700}
.som-run-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
.som-run-cell{background:var(--som-cream);border:2px solid var(--som-ink);border-radius:12px;padding:16px 18px;text-align:center;box-shadow:3px 3px 0 0 var(--som-ink)}
.som-run-cell:nth-child(1){background:var(--som-pink)}.som-run-cell:nth-child(2){background:var(--som-mint)}.som-run-cell:nth-child(3){background:var(--som-yellow)}.som-run-cell:nth-child(4){background:var(--som-blue);color:#fff}
.som-run-cell .lbl{font-family:var(--som-mono);font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:4px;opacity:0.85}
.som-run-cell .val{font-family:var(--som-sans);font-size:28px;font-weight:800;letter-spacing:-0.02em;line-height:1}
.som-speed-note{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:var(--som-yellow);border:2px solid var(--som-ink);border-radius:100px;font-family:var(--som-mono);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-top:16px;box-shadow:3px 3px 0 0 var(--som-ink)}
.som-progress-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.som-progress-title{font-family:var(--som-sans);font-weight:800;font-size:22px;letter-spacing:-0.02em;text-transform:uppercase;display:flex;align-items:center;gap:12px}
.som-progress-title::before{content:'';width:14px;height:14px;background:var(--som-coral);border:2px solid var(--som-ink);border-radius:50%;animation:somPulse 1s ease-in-out infinite}
@keyframes somPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.7);opacity:0.6}}
.som-progress-count{font-family:var(--som-mono);font-size:14px;font-weight:700;background:var(--som-ink);color:var(--som-cream);padding:6px 14px;border-radius:100px}
.som-progress-bar{height:24px;background:var(--som-cream);border:2.5px solid var(--som-ink);border-radius:100px;overflow:hidden;position:relative;margin-bottom:22px}
.som-progress-fill{height:100%;background:repeating-linear-gradient(-45deg,var(--som-coral) 0,var(--som-coral) 8px,var(--som-coral-d) 8px,var(--som-coral-d) 16px);transition:width .4s ease;animation:somSlide 1.2s linear infinite}
@keyframes somSlide{0%{background-position:0 0}100%{background-position:32px 0}}
.som-live-list{display:flex;flex-direction:column;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px}
.som-live-item{display:grid;grid-template-columns:28px 1fr auto;gap:12px;align-items:center;padding:12px 16px;background:var(--som-cream);border:2px solid var(--som-ink);border-radius:10px;font-family:var(--som-sans);font-size:14px;font-weight:500;transition:background .2s}
.som-live-item.running{background:var(--som-yellow)}
.som-live-item.done{background:var(--som-mint)}
.som-live-item .icon{font-family:var(--som-mono);font-weight:800;font-size:14px;width:26px;height:26px;border-radius:50%;background:var(--som-paper);border:2px solid var(--som-ink);display:flex;align-items:center;justify-content:center}
.som-live-item.done .icon{background:var(--som-ink);color:var(--som-mint)}
.som-live-item .text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.som-live-item .status{font-family:var(--som-mono);font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase}
.som-spin{width:14px;height:14px;border:2.5px solid var(--som-ink);border-top-color:transparent;border-radius:50%;animation:somSpin .7s linear infinite}
@keyframes somSpin{to{transform:rotate(360deg)}}
.som-hero-result{background:var(--som-ink);color:var(--som-cream);border:2.5px solid var(--som-ink);border-radius:20px;padding:40px 44px;margin-bottom:28px;box-shadow:var(--som-shadow-lg);position:relative;overflow:hidden}
.som-hero-result::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:var(--som-coral);border-radius:50%;opacity:0.4;filter:blur(40px)}
.som-hero-grid{display:grid;grid-template-columns:1fr auto;gap:32px;align-items:end;position:relative;z-index:1}
.som-hero-eyebrow{font-family:var(--som-mono);font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--som-yellow);margin-bottom:12px}
.som-hero-brand{font-family:var(--som-sans);font-size:28px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin-bottom:8px}
.som-hero-pct{font-family:var(--som-sans);font-size:clamp(120px,22vw,264px);font-weight:900;line-height:0.82;letter-spacing:-0.055em;color:var(--som-cream)}
.som-hero-pct .pct-sym{font-family:var(--som-serif);font-style:italic;font-weight:400;font-size:0.45em;color:var(--som-coral);vertical-align:top;margin-top:0.3em;display:inline-block}
.som-hero-cap{font-family:var(--som-sans);font-weight:500;font-size:16px;color:rgba(245,241,227,0.7);margin-top:12px;max-width:480px;line-height:1.4}
.som-hero-side{display:flex;flex-direction:column;gap:14px;min-width:220px}
.som-delta{background:rgba(245,241,227,0.08);border:2px solid rgba(245,241,227,0.2);border-radius:12px;padding:14px 18px}
.som-delta .lbl{font-family:var(--som-mono);font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(245,241,227,0.55);margin-bottom:4px}
.som-delta .val{font-family:var(--som-sans);font-size:22px;font-weight:800;letter-spacing:-0.02em;color:var(--som-cream)}
.som-delta .val.pos{color:var(--som-mint)}.som-delta .val.neg{color:var(--som-coral)}
.som-bars{background:var(--som-paper);border:2.5px solid var(--som-ink);border-radius:16px;padding:32px 36px;box-shadow:var(--som-shadow-lg);margin-bottom:28px}
.som-bars-h{font-family:var(--som-sans);font-weight:800;font-size:28px;letter-spacing:-0.02em;text-transform:uppercase;margin-bottom:24px;display:flex;align-items:baseline;gap:12px}
.som-bars-h em{font-family:var(--som-serif);font-style:italic;font-weight:400;text-transform:lowercase;font-size:0.85em;color:var(--som-mute)}
.som-bar-row{display:grid;grid-template-columns:minmax(140px,200px) 1fr 90px;gap:16px;align-items:center;padding:14px 0;border-bottom:2px dashed var(--som-line)}
.som-bar-row:last-child{border-bottom:none}
.som-bar-name{font-family:var(--som-sans);font-size:16px;font-weight:700;letter-spacing:-0.01em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.som-bar-name.your{color:var(--som-coral);display:flex;align-items:center;gap:8px}
.som-bar-name.your::before{content:'★';font-size:18px;color:var(--som-yellow);-webkit-text-stroke:1px var(--som-ink)}
.som-bar-track{height:36px;background:var(--som-cream);border:2.5px solid var(--som-ink);border-radius:100px;overflow:hidden;position:relative}
.som-bar-fill{height:100%;border-radius:100px;background:var(--som-ink);transition:width 1.2s cubic-bezier(0.22,0.61,0.36,1);position:relative}
.som-bar-fill.your{background:repeating-linear-gradient(-45deg,var(--som-coral) 0,var(--som-coral) 10px,var(--som-coral-d) 10px,var(--som-coral-d) 20px)}
.som-bar-fill.rank-2{background:var(--som-blue)}.som-bar-fill.rank-3{background:var(--som-mint)}.som-bar-fill.rank-4{background:var(--som-pink)}.som-bar-fill.rank-5{background:var(--som-yellow)}
.som-bar-pct{font-family:var(--som-sans);font-size:24px;font-weight:800;letter-spacing:-0.02em;text-align:right;font-variant-numeric:tabular-nums}
.som-bar-pct.your{color:var(--som-coral)}
.som-prompts-block{background:var(--som-paper);border:2.5px solid var(--som-ink);border-radius:16px;padding:32px 36px;box-shadow:var(--som-shadow-lg);margin-bottom:28px}
.som-prompt-result{border:2px solid var(--som-ink);border-radius:12px;margin-bottom:10px;background:var(--som-cream);overflow:hidden;transition:box-shadow .15s}
.som-prompt-result:hover{box-shadow:3px 3px 0 0 var(--som-ink)}
.som-prompt-result-head{display:grid;grid-template-columns:1fr auto auto;gap:14px;align-items:center;padding:14px 18px;cursor:pointer;font-family:var(--som-sans)}
.som-prompt-result-text{font-size:14px;font-weight:500;line-height:1.4}
.som-score-badge{font-family:var(--som-mono);font-size:11px;font-weight:700;letter-spacing:0.06em;padding:6px 12px;border:2px solid var(--som-ink);border-radius:100px;white-space:nowrap}
.som-score-badge.high{background:var(--som-mint)}.som-score-badge.mid{background:var(--som-yellow)}.som-score-badge.low{background:var(--som-coral);color:#fff}
.som-chev{font-size:14px;font-weight:700;transition:transform .2s}
.som-chev.open{transform:rotate(180deg)}
.som-prompt-result-body{padding:0 18px 18px;border-top:2px dashed var(--som-ink);background:var(--som-paper)}
.som-brand-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding:16px 0}
.som-brand-cell{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;font-family:var(--som-sans);font-size:13px;font-weight:600;border:2px solid var(--som-ink);border-radius:10px;background:var(--som-cream)}
.som-brand-cell.mentioned{background:var(--som-mint)}
.som-brand-cell .pct{font-family:var(--som-mono);font-size:11px;font-weight:700}
.som-insights{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}
.som-insight-col{background:var(--som-paper);border:2.5px solid var(--som-ink);border-radius:16px;padding:28px 30px;box-shadow:var(--som-shadow-lg)}
.som-insight-col.wins{background:var(--som-mint-soft)}
.som-insight-col.gaps{background:var(--som-pink-soft)}
.som-insight-col h3{font-family:var(--som-sans);font-size:22px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;margin-bottom:18px;display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border:2px solid var(--som-ink);border-radius:100px;background:var(--som-paper);box-shadow:3px 3px 0 0 var(--som-ink)}
.som-insight-col ul{list-style:none;padding:0;margin:0}
.som-insight-col li{font-family:var(--som-sans);font-size:15px;font-weight:500;line-height:1.5;padding:10px 0;border-bottom:1.5px dashed rgba(10,10,10,0.2);display:flex;gap:10px}
.som-insight-col li:last-child{border:none}
.som-insight-col li::before{flex-shrink:0;font-weight:800;font-size:18px}
.som-insight-col.wins li::before{content:'✓';color:var(--som-ink)}
.som-insight-col.gaps li::before{content:'→';color:var(--som-coral)}
.som-insight-col em{font-family:var(--som-serif);font-style:italic;font-weight:400}
.som-insight-col strong{font-weight:700}
.som-method{background:var(--som-cream);border:2px dashed var(--som-ink);border-radius:12px;padding:20px 24px;font-family:var(--som-sans);font-size:13px;font-weight:500;color:var(--som-mute);line-height:1.55;margin-bottom:24px}
.som-method strong{font-family:var(--som-mono);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--som-ink);display:block;margin-bottom:6px}
.som-method em{font-family:var(--som-serif);font-style:italic;color:var(--som-ink)}
.som-actions{display:flex;gap:12px;flex-wrap:wrap}
.som-err{padding:12px 18px;background:var(--som-coral);color:#fff;border:2px solid var(--som-ink);border-radius:100px;font-family:var(--som-mono);font-size:12px;font-weight:700;letter-spacing:0.06em;margin-top:16px;box-shadow:3px 3px 0 0 var(--som-ink)}
.som-stage-nav{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}
.som-stage-nav .som-btn{flex:1;min-width:200px}
.som-stage-nav .som-btn.ghost-back{flex:0;min-width:auto}
/* ── Intro copy (transition + methodology) ── */
.som-intro{max-width:780px;margin:-8px 0 48px}
.som-lead{font-family:var(--som-sans);font-size:clamp(20px,2vw,26px);font-weight:600;line-height:1.35;letter-spacing:-0.01em;margin:0 0 18px;color:var(--som-ink)}
.som-method-p{font-family:var(--som-sans);font-size:16px;font-weight:500;line-height:1.55;color:var(--som-mute);margin:0}
.som-lead em,.som-method-p em{font-family:var(--som-serif);font-style:italic;font-weight:400;color:var(--som-ink)}
/* ── Limitations caption ── */
.som-limit{font-family:var(--som-mono);font-size:11.5px;line-height:1.5;letter-spacing:0.02em;color:var(--som-mute);margin:0 0 24px;max-width:700px}
.som-limit em{font-style:italic}
/* ── Tabbed shell (integrated stages) ── */
.som-shell{border:2.5px solid var(--som-ink);border-radius:18px;background:var(--som-paper);box-shadow:var(--som-shadow-lg);overflow:hidden;margin-bottom:28px}
.som-shell .som-stages{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:0;border-bottom:2.5px solid var(--som-ink)}
.som-shell .som-stage-tab{background:var(--som-cream);border:none;border-right:2.5px solid var(--som-ink);border-radius:0;padding:18px 24px;box-shadow:none}
.som-shell .som-stage-tab:last-child{border-right:none}
.som-shell .som-stage-tab:hover{transform:none;box-shadow:inset 0 -5px 0 rgba(10,10,10,0.25)}
.som-shell .som-stage-tab.active{background:var(--som-yellow);box-shadow:inset 0 -6px 0 var(--som-coral)}
.som-shell .som-stage-tab.done{background:var(--som-mint)}
.som-shell .som-stage-tab.active.done{background:var(--som-yellow);box-shadow:inset 0 -6px 0 var(--som-coral)}
.som-shell-body{padding:34px 38px}
.som-card.flush{border:none;border-radius:0;box-shadow:none;padding:0;margin-bottom:0}

/* ── Stage 2 category accordions ── */
.som-cat{border:2px solid var(--som-ink);border-radius:12px;margin-bottom:12px;overflow:hidden;background:var(--som-paper)}
.som-cat-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;cursor:pointer;background:var(--som-cream);transition:background .12s}
.som-cat-head:hover{background:color-mix(in srgb,var(--som-yellow) 22%,var(--som-cream))}
.som-cat-title{display:flex;align-items:center;gap:12px;font-family:var(--som-sans);font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:-0.01em}
.som-cat-badge{font-family:var(--som-mono);font-size:10px;font-weight:700;letter-spacing:0.12em;padding:4px 10px;border-radius:100px;background:var(--som-ink);color:var(--som-cream)}
.som-cat-meta{display:flex;align-items:center;gap:14px}
.som-cat-count{font-family:var(--som-mono);font-size:11px;font-weight:700;color:var(--som-coral)}
.som-cat-chev{font-size:13px;transition:transform .2s}
.som-cat-chev.open{transform:rotate(180deg)}
.som-cat-body{padding:10px 12px 14px;display:flex;flex-direction:column;gap:8px}
.som-cat-prompt{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:2px solid var(--som-ink);border-radius:10px;background:var(--som-cream);cursor:pointer;text-align:left;font-family:var(--som-sans);transition:background .12s,box-shadow .12s,transform .12s}
.som-cat-prompt:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 0 var(--som-ink);background:var(--som-paper)}
.som-cat-prompt.selected{background:var(--som-yellow);box-shadow:3px 3px 0 0 var(--som-ink)}
.som-cat-check{width:20px;height:20px;border:2px solid var(--som-ink);border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;background:var(--som-paper);margin-top:1px;line-height:1}
.som-cat-prompt.selected .som-cat-check{background:var(--som-coral);color:#fff}
.som-cat-ptext{font-size:14px;font-weight:500;line-height:1.4}

/* ── Hero trend chip ── */
.som-trend{display:inline-flex;align-items:center;gap:8px;font-family:var(--som-mono);font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:7px 15px;border-radius:100px;border:2px solid var(--som-ink);background:var(--som-cream);color:var(--som-ink);margin-top:16px}
.som-trend.up{background:var(--som-mint)}.som-trend.down{background:var(--som-coral);color:#fff}.som-trend.flat{background:var(--som-yellow)}
.som-trend .ar{font-size:15px;line-height:1}

/* ── Measure / Compare toggle ── */
.som-board-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:8px}
.som-measure{display:inline-flex;border:2.5px solid var(--som-ink);border-radius:100px;overflow:hidden;box-shadow:3px 3px 0 0 var(--som-ink)}
.som-measure button{appearance:none;border:none;background:var(--som-paper);font-family:var(--som-mono);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:10px 16px;cursor:pointer;border-right:2px solid var(--som-ink);color:var(--som-ink);transition:background .12s}
.som-measure button:last-child{border-right:none}
.som-measure button.on{background:var(--som-coral);color:#fff}
.som-board-note{font-family:var(--som-serif);font-style:italic;font-size:14px;color:var(--som-mute);margin:2px 0 18px}

/* ── Lollipop leaderboard ── */
.som-lolli-row{display:grid;grid-template-columns:minmax(120px,190px) 1fr 132px;gap:18px;align-items:center;padding:16px 0;border-bottom:2px dashed var(--som-line)}
.som-lolli-row:last-child{border-bottom:none}
.som-lolli-name{font-family:var(--som-sans);font-size:16px;font-weight:700;letter-spacing:-0.01em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.som-lolli-name.your{color:var(--som-coral);display:flex;align-items:center;gap:8px}
.som-lolli-name.your::before{content:'★';font-size:18px;color:var(--som-yellow);-webkit-text-stroke:1px var(--som-ink)}
.som-lolli-track{position:relative;height:30px;display:flex;align-items:center}
.som-lolli-base{position:absolute;left:0;right:0;height:3px;border-radius:100px;background:repeating-linear-gradient(90deg,var(--som-line) 0 7px,transparent 7px 12px)}
.som-lolli-stem{position:absolute;left:0;height:6px;border-radius:100px;background:var(--som-ink);width:0;transition:width 1s cubic-bezier(.22,.61,.36,1)}
.som-lolli-stem.your{background:repeating-linear-gradient(-45deg,var(--som-coral) 0,var(--som-coral) 9px,var(--som-coral-d) 9px,var(--som-coral-d) 18px)}
.som-lolli-dot{position:absolute;width:28px;height:28px;border-radius:50%;border:2.5px solid var(--som-ink);background:var(--som-blue);left:0;transform:translateX(-50%);transition:left 1s cubic-bezier(.22,.61,.36,1);box-shadow:2px 2px 0 0 rgba(10,10,10,.25)}
.som-lolli-dot.your{background:var(--som-coral)}
.som-lolli-dot.rank-2{background:var(--som-blue)}.som-lolli-dot.rank-3{background:var(--som-mint)}.som-lolli-dot.rank-4{background:var(--som-pink)}.som-lolli-dot.rank-5{background:var(--som-yellow)}
.som-lolli-val{display:flex;flex-direction:column;align-items:flex-end;justify-content:center}
.som-lolli-pct{font-family:var(--som-sans);font-size:25px;font-weight:800;letter-spacing:-0.02em;font-variant-numeric:tabular-nums;line-height:1}
.som-lolli-pct.your{color:var(--som-coral)}
.som-lolli-sub{font-family:var(--som-mono);font-size:9.5px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--som-mute);margin-top:4px;white-space:nowrap}

/* ── Hand-drawn annotations ── */
.som-scribble{position:absolute;pointer-events:none;z-index:6;display:flex;flex-direction:column;align-items:center}
.som-scribble .lbl{font-family:'Caveat',cursive;font-weight:700;font-size:23px;line-height:1;color:var(--som-coral);white-space:nowrap}
.som-scribble svg{display:block;overflow:visible}

@media (max-width:900px){
  .som-section{padding:60px 24px 80px}.som-marquee{margin:-60px -24px 40px}
  .som-header{grid-template-columns:1fr}.som-burst{width:160px;height:160px;margin:0 auto}
  .som-burst-text{font-size:14px;padding:0 28px}.som-card{padding:24px 22px}
  .som-stages{grid-template-columns:1fr}.som-stage-tab{padding:14px 18px}
  .som-field-row{grid-template-columns:1fr;gap:16px}.som-prompt-grid{grid-template-columns:1fr}
  .som-run-summary{grid-template-columns:repeat(2,1fr)}.som-hero-grid{grid-template-columns:1fr}
  .som-hero-side{flex-direction:row;flex-wrap:wrap}.som-hero-side>*{flex:1;min-width:140px}
  .som-bar-row{grid-template-columns:100px 1fr 60px;gap:10px}
  .som-bar-name{font-size:13px}.som-bar-pct{font-size:18px}
  .som-bars,.som-prompts-block{padding:22px}.som-insights{grid-template-columns:1fr}.som-insight-col{padding:22px}
  .som-shell-body{padding:22px}
  .som-lolli-row{grid-template-columns:92px 1fr 86px;gap:10px}
  .som-lolli-name{font-size:13px}.som-lolli-pct{font-size:18px}
  .som-measure{flex-wrap:wrap}
  .som-scribble{display:none}
}
@media (prefers-reduced-motion: reduce){
  .som-marquee,.som-progress-fill,.som-bar-fill,.som-lolli-stem,.som-lolli-dot,.som-spin,.som-progress-title::before,.som-live-item,.som-cat-prompt,.som-prompt-card{animation:none !important;transition:none !important}
}
`;


// Respect prefers-reduced-motion for programmatic scrolling (CSS scroll-behavior
// does not apply to explicit JS behavior options).
const somScrollBehavior = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const ShareOfModelTool = () => {
  const [stage, setStage] = useState(1);
  const [doneStages, setDoneStages] = useState(new Set());

  const [yourBrand, setYourBrand] = useState('');
  const [category, setCategory] = useState('');
  const [market, setMarket] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [compInput, setCompInput] = useState('');

  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [customInput, setCustomInput] = useState('');

  const [depth, setDepth] = useState(1);
  const [styleMode, setStyleMode] = useState('natural');
  const [measure, setMeasure] = useState('share'); // 'share' | 'first' | 'sentiment'
  const [trend, setTrend] = useState(null); // { delta, prevPct } vs last saved run

  const [err1, setErr1] = useState(false);
  const [err2, setErr2] = useState(false);
  const [err3, setErr3] = useState('');

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [liveStatus, setLiveStatus] = useState({}); // { promptIndex: 'running'|'done' }
  const [results, setResults] = useState(null);
  const [openPR, setOpenPR] = useState({});
  const [openCats, setOpenCats] = useState({});

  const sectionRef = useRef(null);
  const resultsRef = useRef(null);
  const runBtnRef = useRef(null);
  const resultHeadRef = useRef(null);
  const historyRef = useRef([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('som_state_v2');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.yourBrand) setYourBrand(s.yourBrand);
        if (s.category) setCategory(s.category);
        if (s.market) setMarket(s.market);
        if (Array.isArray(s.competitors)) setCompetitors(s.competitors);
        if (Array.isArray(s.selectedPrompts)) setSelectedPrompts(s.selectedPrompts);
        if (s.depth) setDepth(s.depth);
      }
      const h = localStorage.getItem('som_history_v2');
      if (h) historyRef.current = JSON.parse(h) || [];
      const r = localStorage.getItem('som_results_v2');
      if (r) {
        const rd = JSON.parse(r);
        if (rd && rd.results) {
          setResults(rd.results);
          setStage(3);
          setDoneStages(new Set([1, 2]));
          if (rd.trend) setTrend(rd.trend);
        }
      }
    } catch (e) {}
  }, []);

  // Persist inputs as they change
  useEffect(() => {
    try {
      localStorage.setItem('som_state_v2', JSON.stringify({
        yourBrand, category, market, competitors, selectedPrompts, depth
      }));
    } catch (e) {}
  }, [yourBrand, category, market, competitors, selectedPrompts, depth]);

  const fillTpl = (t) =>
  t.replace(/{CATEGORY}/g, category || 'the category').
  replace(/{BRAND}/g, yourBrand || 'your brand').
  replace(/{MARKET}/g, market || 'your target audience');

  const validate1 = () => {
    if (!yourBrand.trim() || !category.trim() || competitors.length === 0) {
      setErr1(true);return false;
    }
    setErr1(false);return true;
  };
  const validate2 = () => {
    if (selectedPrompts.length === 0) {setErr2(true);return false;}
    setErr2(false);return true;
  };

  const goStage = (n) => {
    if (n === 2 && !validate1()) return;
    if (n === 3 && !validate2()) return;
    setDoneStages((prev) => {
      const next = new Set(prev);
      for (let i = 1; i < n; i++) next.add(i);
      return next;
    });
    setStage(n);
    if (n === 3) {
      setResults(null);
      setRunning(false);
    }
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: somScrollBehavior(), block: 'start' }), 50);
  };

  const addCompetitor = () => {
    const v = compInput.trim();
    if (!v || competitors.includes(v) || competitors.length >= 8) {setCompInput('');return;}
    setCompetitors([...competitors, v]);setCompInput('');
  };
  const removeCompetitor = (i) => setCompetitors(competitors.filter((_, idx) => idx !== i));

  const togglePrompt = (filled) => {
    setSelectedPrompts((prev) =>
    prev.includes(filled) ? prev.filter((p) => p !== filled) : [...prev, filled]
    );
  };
  const addCustom = () => {
    const v = fillTpl(customInput.trim());
    if (!v || selectedPrompts.includes(v)) {setCustomInput('');return;}
    setSelectedPrompts([...selectedPrompts, v]);setCustomInput('');
  };
  const removeSelected = (i) => setSelectedPrompts(selectedPrompts.filter((_, idx) => idx !== i));

  const runSummary = useMemo(() => {
    const p = selectedPrompts.length;
    const c = competitors.length + 1;
    const total = p * depth;
    const eta = Math.max(8, Math.ceil(total * 1.2));
    return { brands: c, prompts: p, queries: total, eta };
  }, [selectedPrompts.length, competitors.length, depth]);

  const run = async () => {
    setErr3('');
    const allBrands = [yourBrand, ...competitors];
    const reps = depth;

    const tasks = [];
    selectedPrompts.forEach((prompt, pi) => {
      for (let r = 0; r < reps; r++) tasks.push({ pi, prompt, r });
    });
    const total = tasks.length;

    setRunning(true);
    setResults(null);
    setProgress({ done: 0, total });

    const initStatus = {};
    selectedPrompts.forEach((_, i) => {initStatus[i] = 'running';});
    setLiveStatus(initStatus);

    const tally = selectedPrompts.map(() => {const t = {};allBrands.forEach((b) => t[b] = 0);return t;});
    const firstTally = selectedPrompts.map(() => {const t = {};allBrands.forEach((b) => t[b] = 0);return t;});
    const sentTally = selectedPrompts.map(() => {const t = {};allBrands.forEach((b) => t[b] = { positive: 0, neutral: 0, negative: 0 });return t;});
    const completions = selectedPrompts.map(() => 0);
    let doneCount = 0;

    try {
      await Promise.all(tasks.map(async (task) => {
        const raw = await somAskModel(task.prompt, allBrands);
        const { answer, meta } = somSplitMeta(raw);
        const mentioned = [];
        allBrands.forEach((b) => {
          const sent = somParseSentiment(meta, b);
          const isMention = sent ? sent !== 'absent' : somMentions(answer, b);
          if (isMention) {
            tally[task.pi][b]++;
            mentioned.push(b);
            if (sent === 'positive') sentTally[task.pi][b].positive++;else
            if (sent === 'negative') sentTally[task.pi][b].negative++;else
            sentTally[task.pi][b].neutral++;
          }
        });
        const first = somFirstBrand(answer, mentioned);
        if (first) firstTally[task.pi][first]++;
        completions[task.pi]++;
        doneCount++;
        setProgress({ done: doneCount, total });
        if (completions[task.pi] === reps) setLiveStatus((prev) => ({ ...prev, [task.pi]: 'done' }));
      }));

      const finalResults = selectedPrompts.map((prompt, i) => ({
        prompt, reps, mentions: tally[i], firsts: firstTally[i], sentiment: sentTally[i]
      }));

      const totalSlots = selectedPrompts.length * reps;
      let yours = 0;
      finalResults.forEach((r) => {yours += r.mentions[yourBrand];});
      const yourPct = totalSlots ? Math.round(yours / totalSlots * 100) : 0;
      const key = (yourBrand + '|' + category).toLowerCase();
      const prev = [...historyRef.current].reverse().find((h) => h.key === key);
      const trendObj = prev ? { delta: yourPct - prev.pct, prevPct: prev.pct } : null;
      historyRef.current = [...historyRef.current, { key, pct: yourPct, at: Date.now() }].slice(-40);
      try {localStorage.setItem('som_history_v2', JSON.stringify(historyRef.current));} catch (e) {}
      try {localStorage.setItem('som_results_v2', JSON.stringify({ results: finalResults, trend: trendObj, yourBrand, competitors }));} catch (e) {}

      setTrend(trendObj);
      setMeasure('share');
      setResults(finalResults);
      setRunning(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: somScrollBehavior(), block: 'start' });
        resultHeadRef.current?.focus();
      }, 100);
    } catch (e) {
      setErr3(e.message || 'CONNECTION FAILED — TRY FEWER PROMPTS');
      setRunning(false);
    }
  };

  const reset = () => {
    setYourBrand('');setCategory('');setMarket('');
    setCompetitors([]);setSelectedPrompts([]);
    setResults(null);setDoneStages(new Set());setStage(1);
    setLiveStatus({});setProgress({ done: 0, total: 0 });
    setTrend(null);setMeasure('share');
    try {localStorage.removeItem('som_results_v2');} catch (e) {}
  };

  const tryExample = () => {
    const cat = 'preppy coastal apparel';
    const mkt = 'US shoppers 25–45';
    const fill = (t) => t.replace(/{CATEGORY}/g, cat).replace(/{BRAND}/g, 'Vineyard Vines').replace(/{MARKET}/g, mkt);
    setYourBrand('Vineyard Vines');
    setCategory(cat);
    setMarket(mkt);
    setCompetitors(['Ralph Lauren', 'Lacoste', 'Brooks Brothers', 'J.Crew']);
    setSelectedPrompts(SOM_VAULT.slice(0, 4).map((p) => fill(p.tpl)));
    setDoneStages(new Set([1, 2]));
    setStage(3);
    setResults(null);
    setTimeout(() => runBtnRef.current?.focus(), 120);
  };

  const exportCSV = () => {
    if (!results) return;
    const allBrands = [yourBrand, ...competitors];
    let csv = 'Prompt,' + allBrands.map((b) => '"' + b + '"').join(',') + '\n';
    results.forEach((r) => {
      const row = ['"' + r.prompt.replace(/"/g, '""') + '"'];
      allBrands.forEach((b) => row.push(Math.round(r.mentions[b] / r.reps * 100) + '%'));
      csv += row.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `share-of-model-${yourBrand.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyReport = () => {
    if (!results) return;
    const allBrands = [yourBrand, ...competitors];
    const total = selectedPrompts.length * results[0].reps;
    const totals = {};
    allBrands.forEach((b) => totals[b] = 0);
    results.forEach((r) => allBrands.forEach((b) => totals[b] += r.mentions[b]));
    let report = `SHARE OF MODEL — ${yourBrand}\n`;
    report += `Category: ${category} · ${new Date().toLocaleDateString()}\n`;
    report += `${selectedPrompts.length} prompts · ${results[0].reps} runs · ${total} queries\n`;
    report += '─'.repeat(50) + '\n\nLEADERBOARD\n';
    allBrands.map((b) => ({ b, pct: Math.round(totals[b] / total * 100) })).
    sort((a, b) => b.pct - a.pct).
    forEach(({ b, pct }) => {report += `  ${b.padEnd(28)} ${String(pct).padStart(3)}%\n`;});
    report += '\nPROMPT BREAKDOWN\n' + '─'.repeat(50) + '\n';
    results.forEach((r) => {
      report += `\n${r.prompt}\n`;
      allBrands.forEach((b) => {
        report += `  ${b.padEnd(28)} ${Math.round(r.mentions[b] / r.reps * 100)}%\n`;
      });
    });
    navigator.clipboard.writeText(report).then(() => alert('Report copied to clipboard.'));
  };

  // ── Derived results data ─────────────────────────
  const derived = useMemo(() => {
    if (!results || !results.length) return null;
    const allBrands = [yourBrand, ...competitors];
    const reps = results[0].reps;
    const totalSlots = results.length * reps;

    const totals = {},firstTotals = {},sentTotals = {};
    allBrands.forEach((b) => {totals[b] = 0;firstTotals[b] = 0;sentTotals[b] = { positive: 0, neutral: 0, negative: 0 };});
    results.forEach((r) => allBrands.forEach((b) => {
      totals[b] += r.mentions[b] || 0;
      firstTotals[b] += r.firsts && r.firsts[b] || 0;
      if (r.sentiment && r.sentiment[b]) {
        sentTotals[b].positive += r.sentiment[b].positive || 0;
        sentTotals[b].neutral += r.sentiment[b].neutral || 0;
        sentTotals[b].negative += r.sentiment[b].negative || 0;
      }
    }));

    const pct = (n) => totalSlots ? Math.round(n / totalSlots * 100) : 0;
    const favPct = (b) => {
      const s = sentTotals[b];const m = s.positive + s.neutral + s.negative;
      return m ? Math.round(s.positive / m * 100) : 0;
    };

    const yours = totals[yourBrand];
    const yourPct = pct(yours);
    const yourFirstPct = pct(firstTotals[yourBrand]);
    const yourFav = favPct(yourBrand);
    const compTotals = competitors.map((c) => totals[c]);
    const topComp = competitors.length ? competitors[compTotals.indexOf(Math.max(...compTotals))] : null;
    const topPct = topComp ? pct(totals[topComp]) : 0;
    const avgPct = competitors.length ?
    Math.round(compTotals.reduce((a, b) => a + b, 0) / competitors.length / totalSlots * 100) :
    0;
    const delta = yourPct - topPct;
    const deltaAvg = yourPct - avgPct;

    const board = {
      share: allBrands.map((b) => ({ brand: b, value: pct(totals[b]), sub: `${totals[b]}/${totalSlots} answers` })).sort((a, b) => b.value - a.value),
      first: allBrands.map((b) => ({ brand: b, value: pct(firstTotals[b]), sub: `named first ${firstTotals[b]}×` })).sort((a, b) => b.value - a.value),
      sentiment: allBrands.map((b) => ({ brand: b, value: favPct(b), sub: totals[b] ? `${sentTotals[b].positive} pos · ${sentTotals[b].negative} neg` : 'not mentioned', n: totals[b] })).sort((a, b) => b.value - a.value)
    };

    const wins = [],gaps = [];
    if (delta > 0 && topComp) wins.push(`Leading <strong>${topComp}</strong> by ${delta} pp in Share of Model.`);
    if (yourFirstPct >= 30) wins.push(`Named <strong>first</strong> in ${yourFirstPct}% of answers — pole position.`);
    if (yourFav >= 60 && yours) wins.push(`Sentiment skews positive — <strong>${yourFav}%</strong> favorable when mentioned.`);
    if (yourPct >= 50) wins.push(`Strong AI visibility — present in <strong>${yourPct}%</strong> of responses.`);
    results.forEach((r) => {if (r.mentions[yourBrand] === r.reps) wins.push(`Owned the prompt: <em>"${r.prompt.length > 60 ? r.prompt.slice(0, 60) + '…' : r.prompt}"</em>`);});

    if (delta < 0 && topComp) gaps.push(`Trailing <strong>${topComp}</strong> by <strong>${Math.abs(delta)} pp</strong> — study their content moves.`);
    if (yours && yourFirstPct < 15) gaps.push(`Rarely named <strong>first</strong> (${yourFirstPct}%) — an afterthought, not the default.`);
    if (yours && yourFav < 40) gaps.push(`Sentiment is lukewarm — only <strong>${yourFav}%</strong> favorable. Strengthen proof & narrative.`);
    if (yourPct < 30) gaps.push(`Low overall Share of Model — prioritise GEO/AEO content sprints.`);
    results.forEach((r) => {if ((r.mentions[yourBrand] || 0) === 0) gaps.push(`Invisible on: <em>"${r.prompt.length > 60 ? r.prompt.slice(0, 60) + '…' : r.prompt}"</em>`);});

    return {
      allBrands, totalSlots, reps, yours, yourPct, yourFirstPct, yourFav,
      topComp, topPct, avgPct, delta, deltaAvg, board, sorted: board.share,
      wins: wins.length ? wins.slice(0, 5) : ['Run more prompts to surface clear wins.'],
      gaps: gaps.length ? gaps.slice(0, 5) : ['No major gaps detected — maintain current strategy.']
    };
  }, [results, yourBrand, competitors]);

  // Animate lollipops after results render / measure change
  useEffect(() => {
    if (!derived) return;
    const id = setTimeout(() => {
      document.querySelectorAll('.som-lolli-stem[data-w]').forEach((el) => {el.style.width = el.dataset.w + '%';});
      document.querySelectorAll('.som-lolli-dot[data-x]').forEach((el) => {el.style.left = el.dataset.x + '%';});
    }, 80);
    return () => clearTimeout(id);
  }, [derived, measure]);

  return (
    <section className="som-section" id="module-04" ref={sectionRef} data-screen-label="04 Share of Model">
      <style>{SOM_STYLES}</style>

      <div className="som-marquee">
        <div className="center"><span className="star">✦</span> MODULE 04 / INTERACTIVE</div>
        <div className="center">SHARE OF MODEL · LIVE TOOL</div>
        <div className="center">RUN. READ. ITERATE. <span className="star">✦</span></div>
      </div>

      <div className="som-wrap">
        {/* HEADER */}
        <div className="som-header">
          <div className="som-header-left">
            <div className="som-pill-row">
              <span className="som-tag-pill yellow">THE TOOL</span>
              <span className="som-tag-pill pink">CHAPTER 04</span>
              <span className="som-tag-pill blue">RUN IT NOW</span>
            </div>
            <h2 className="som-headline">
              ARE YOU IN <span className="som-mark-yellow">THE</span><br />
              ANSWER, <em>or</em><br />
              OUTSIDE IT?
            </h2>
            <p className="som-deck">
              Run a live <span className="mark-mint">Share of Model</span> on your brand against{' '}
              <span className="mark-pink">your competition</span> — straight from this page. Pick prompts.
              Hit run. Get a percentage. No spreadsheets.
            </p>
          </div>
          <div className="som-burst">
            <span className="som-brk tl"></span><span className="som-brk tr"></span>
            <span className="som-brk bl"></span><span className="som-brk br"></span>
            <div>
              <div className="som-burst-lab">built in</div>
              <div className="som-burst-text">UNDER<br /><mark>60</mark> SEC</div>
            </div>
          </div>
        </div>

        {/* INTRO COPY — transition + methodology */}
        <div className="som-intro">
          <p className="som-lead">You just mapped the gap you <em>want</em> to close. This measures the one you actually have.</p>
          <p className="som-method-p">Presence, primacy, and sentiment are three different questions. This tool keeps them separate: <em>Share of Model</em> (how often you surface), <em>first-mention rate</em> (how often you're the default the model reaches for), and <em>favorability</em> (the tone when you're named). Conflating them is the most common mistake in AI-visibility measurement.</p>
        </div>

        {/* TABBED SHELL — tabs + active stage live in one box */}
        <div className="som-shell">
        <div className="som-stages">
          {[1, 2, 3].map((n) => {
              const labels = { 1: 'BRANDS', 2: 'PROMPTS', 3: 'THE READ' };
              const cls = `som-stage-tab${stage === n ? ' active' : ''}${doneStages.has(n) ? ' done' : ''}`;
              return (
                <button key={n} className={cls} onClick={() => goStage(n)}>
                <div className="som-stage-num"><span>STAGE 0{n}</span><span className="check">✓</span></div>
                <div className="som-stage-name">{labels[n]}</div>
              </button>);

            })}
        </div>
        <div className="som-shell-body">

        {/* ── STAGE 1 ── */}
        {stage === 1 &&
            <div className="som-stage active">
            <div className="som-card flush">
              <h2 className="som-card-title">THE <em>lineup</em>.</h2>
              <p className="som-card-sub">Tell the machines who you are and who you're up against. Two minutes, tops.</p>
              <div style={{ margin: '0 0 22px' }}>
                <button className="som-btn mint" onClick={tryExample}>✦ TRY AN EXAMPLE</button>
              </div>

              <div className="som-field-row">
                <div className="som-field">
                  <label className="som-label">YOUR BRAND <span className="req">*</span></label>
                  <input type="text" className="som-input" value={yourBrand}
                    onChange={(e) => setYourBrand(e.target.value)}
                    placeholder="e.g. Sleepy Owl Coffee" />
                </div>
                <div className="som-field">
                  <label className="som-label">CATEGORY <span className="req">*</span></label>
                  <input type="text" className="som-input" value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Indian D2C cold brew" />
                </div>
              </div>

              <div className="som-field">
                <label className="som-label">TARGET MARKET <span className="opt">— optional, sharpens results</span></label>
                <input type="text" className="som-input" value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  placeholder="e.g. Urban professionals, 25–40, India metros" />
              </div>

              <div className="som-field">
                <label className="som-label">COMPETITORS <span className="req">*</span></label>
                <p style={{ fontFamily: 'var(--som-serif)', fontStyle: 'italic', color: 'var(--som-mute)', margin: '-2px 0 12px', fontSize: 14 }}>Add 2 to 6. Press Enter or tap Add.</p>
                <div className="som-add-row">
                  <input type="text" className="som-input" value={compInput}
                    onChange={(e) => setCompInput(e.target.value)}
                    onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault();addCompetitor();}}}
                    placeholder="Type a competitor name…" />
                  <button className="som-btn" onClick={addCompetitor}>+ ADD</button>
                </div>
                <div className="som-pills">
                  {competitors.map((c, i) =>
                    <span key={i} className="som-pill">
                      {c} <button className="x" aria-label={`Remove ${c}`} onClick={() => removeCompetitor(i)}>×</button>
                    </span>
                    )}
                </div>
              </div>

              {err1 && <div className="som-err">⚠ ADD YOUR BRAND, CATEGORY, AND AT LEAST ONE COMPETITOR</div>}

              <div className="som-stage-nav">
                <button className="som-btn coral" onClick={() => goStage(2)}>STAGE 02 — CHOOSE PROMPTS →</button>
              </div>
            </div>
          </div>
            }

        {/* ── STAGE 2 ── */}
        {stage === 2 &&
            <div className="som-stage active">
            <div className="som-card flush">
              <h2 className="som-card-title">THE <em>questions</em>.</h2>
              <p className="som-card-sub">These are the prompts your brand is being judged against. Pick from the vault, write your own, or both. Use <strong>{'{CATEGORY}'}</strong>, <strong>{'{BRAND}'}</strong>, <strong>{'{MARKET}'}</strong> as placeholders.</p>

              <div className="som-field">
                <label className="som-label">FROM THE VAULT <span className="opt">— grouped by intent</span></label>
                {(() => {
                    const order = [];
                    const byCat = {};
                    SOM_VAULT.forEach((p) => {if (!byCat[p.type]) {byCat[p.type] = [];order.push(p.type);}byCat[p.type].push(p);});
                    return order.map((cat, ci) => {
                      const items = byCat[cat];
                      const filledList = items.map((p) => fillTpl(p.tpl));
                      const selCount = filledList.filter((f) => selectedPrompts.includes(f)).length;
                      const isOpen = cat in openCats ? openCats[cat] : ci === 0;
                      return (
                        <div key={cat} className="som-cat">
                        <div className="som-cat-head" role="button" tabIndex={0} aria-expanded={isOpen} onClick={() => setOpenCats((prev) => ({ ...prev, [cat]: !(cat in prev ? prev[cat] : ci === 0) }))} onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();setOpenCats((prev) => ({ ...prev, [cat]: !(cat in prev ? prev[cat] : ci === 0) }));}}}>
                          <div className="som-cat-title">
                            <span className="som-cat-badge">{cat}</span>
                            {items.length} prompt{items.length > 1 ? 's' : ''}
                          </div>
                          <div className="som-cat-meta">
                            {selCount > 0 && <span className="som-cat-count">{selCount} selected</span>}
                            <span className={`som-cat-chev${isOpen ? ' open' : ''}`}>▾</span>
                          </div>
                        </div>
                        {isOpen &&
                          <div className="som-cat-body">
                            {items.map((p, i) => {
                              const filled = filledList[i];
                              const sel = selectedPrompts.includes(filled);
                              return (
                                <button key={i} className={`som-cat-prompt${sel ? ' selected' : ''}`} onClick={() => togglePrompt(filled)}>
                                  <span className="som-cat-check">{sel ? '✓' : ''}</span>
                                  <span className="som-cat-ptext">{filled}</span>
                                </button>);

                            })}
                          </div>
                          }
                      </div>);

                    });
                  })()}
              </div>

              <div className="som-field">
                <label className="som-label">CUSTOM PROMPT</label>
                <div className="som-add-row">
                  <input type="text" className="som-input" value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault();addCustom();}}}
                    placeholder='e.g. "What {CATEGORY} brand makes the best gift?"' />
                  <button className="som-btn" onClick={addCustom}>+ ADD</button>
                </div>
              </div>

              {selectedPrompts.length > 0 &&
                <div className="som-selected-list">
                  <label className="som-label" style={{ marginBottom: 14 }}>SELECTED — {selectedPrompts.length} PROMPTS</label>
                  {selectedPrompts.map((p, i) =>
                  <div key={i} className="som-selected-item">
                      <span className="num">{i + 1}</span>
                      <div className="text">{p}</div>
                      <button aria-label={`Remove prompt: ${p}`} onClick={() => removeSelected(i)}>×</button>
                    </div>
                  )}
                </div>
                }

              {err2 && <div className="som-err">⚠ SELECT OR ADD AT LEAST ONE PROMPT</div>}

              <div className="som-stage-nav">
                <button className="som-btn ghost ghost-back" onClick={() => goStage(1)}>← BACK</button>
                <button className="som-btn coral" onClick={() => goStage(3)}>STAGE 03 — RUN ANALYSIS →</button>
              </div>
            </div>
          </div>
            }

        {/* ── STAGE 3 ── */}
        {stage === 3 &&
            <div className="som-stage active">
            {!results &&
              <>
                <div className="som-card flush">
                  <h2 className="som-card-title">RUN <em>the read</em>.</h2>
                  <p className="som-card-sub">All prompts fire in parallel. Most analyses complete in 15–45 seconds.</p>

                  <div className="som-run-summary">
                    <div className="som-run-cell"><div className="lbl">BRANDS</div><div className="val">{runSummary.brands}</div></div>
                    <div className="som-run-cell"><div className="lbl">PROMPTS</div><div className="val">{runSummary.prompts}</div></div>
                    <div className="som-run-cell"><div className="lbl">QUERIES</div><div className="val">{runSummary.queries}</div></div>
                    <div className="som-run-cell"><div className="lbl">EST. TIME</div><div className="val">~{runSummary.eta}s</div></div>
                  </div>

                  <div className="som-field">
                    <label className="som-label">DEPTH <span className="opt">— more runs, steadier numbers</span></label>
                    <select className="som-select" value={depth} onChange={(e) => setDepth(parseInt(e.target.value))}>
                      <option value={1}>Standard — 1 run / prompt (fastest)</option>
                      <option value={2}>Confident — 2 runs / prompt</option>
                      <option value={3}>Deep — 3 runs / prompt (most reliable)</option>
                    </select>
                  </div>

                  <button ref={runBtnRef} className="som-btn coral full" disabled={running} onClick={run} style={{ fontSize: 16, padding: 18 }}>
                    ▸ RUN SHARE OF MODEL
                  </button>
                  <div style={{ textAlign: 'center' }}>
                    <div className="som-speed-note">⚡ PARALLEL EXECUTION · NO QUEUEING</div>
                  </div>
                  {err3 && <div className="som-err">⚠ {err3}</div>}
                </div>

                {running &&
                <div className="som-card">
                    <div className="som-progress-head">
                      <div className="som-progress-title">QUERYING THE MACHINES</div>
                      <div className="som-progress-count">{progress.done} / {progress.total}</div>
                    </div>
                    <div className="som-progress-bar">
                      <div className="som-progress-fill" style={{ width: progress.total ? `${progress.done / progress.total * 100}%` : '0%' }} />
                    </div>
                    <div className="som-live-list">
                      {selectedPrompts.map((p, i) => {
                      const status = liveStatus[i] || 'running';
                      return (
                        <div key={i} className={`som-live-item ${status}`}>
                            <span className="icon">{status === 'done' ? '✓' : <span className="som-spin"></span>}</span>
                            <span className="text">{p}</span>
                            <span className="status">{status === 'done' ? 'DONE' : 'RUNNING'}</span>
                          </div>);

                    })}
                    </div>
                  </div>
                }
              </>
              }

            {/* Results */}
            {results && derived &&
              <div ref={resultsRef} aria-live="polite">
                <div className="som-annote" style={{ position: 'relative' }}>
                <div className="som-hero-result">
                  <div className="som-hero-grid">
                    <div>
                      <div className="som-hero-eyebrow">
                        RESULTS · {category.toUpperCase()} · LIVE ENGINE · CLAUDE
                      </div>
                      <div className="som-hero-brand" ref={resultHeadRef} tabIndex={-1}>{yourBrand.toUpperCase()}</div>
                      <div className="som-hero-pct">{derived.yourPct}<span className="pct-sym">%</span></div>
                      <div className="som-hero-cap">
                        Share of Model — mentioned in {derived.yours} of {derived.totalSlots} answers across {results.length} prompts. Named first {derived.yourFirstPct}% of the time.
                      </div>
                      {trend &&
                        <div className={`som-trend ${trend.delta > 0 ? 'up' : trend.delta < 0 ? 'down' : 'flat'}`}>
                          <span className="ar">{trend.delta > 0 ? '▲' : trend.delta < 0 ? '▼' : '■'}</span>
                          {trend.delta > 0 ? '+' : ''}{trend.delta} pp vs last run · was {trend.prevPct}%
                        </div>
                        }
                    </div>
                    <div className="som-hero-side">
                      <div className="som-delta">
                        <div className="lbl">VS. TOP COMPETITOR</div>
                        <div className={`val ${derived.delta >= 0 ? 'pos' : 'neg'}`}>
                          {(derived.delta >= 0 ? '+' : '') + derived.delta} pp
                        </div>
                      </div>
                      <div className="som-delta">
                        <div className="lbl">FIRST-MENTION RATE</div>
                        <div className="val">{derived.yourFirstPct}%</div>
                      </div>
                      <div className="som-delta">
                        <div className="lbl">FAVORABILITY</div>
                        <div className={`val ${derived.yourFav >= 50 ? 'pos' : 'neg'}`}>{derived.yourFav}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="som-scribble" style={{ left: '32px', bottom: '-26px' }}>
                  <SomArrow />
                  <span className="lbl">your share of the answer</span>
                </div>
                </div>
                <div className="som-limit">Directional, not absolute: results vary by prompt phrasing and model version. Re-run on a fixed prompt set to track <em>delta</em> over time — that delta is the number that matters.</div>

                <div className="som-bars" style={{ position: 'relative' }}>
                  <div className="som-board-head">
                    <div className="som-bars-h" style={{ marginBottom: 0 }}>THE LEADERBOARD</div>
                    <div className="som-measure" role="tablist" aria-label="Compare by">
                      {[['share', 'SHARE'], ['first', 'FIRST MENTION'], ['sentiment', 'SENTIMENT']].map(([m, l]) =>
                      <button key={m} role="tab" aria-selected={measure === m} className={measure === m ? 'on' : ''} onClick={() => setMeasure(m)}>{l}</button>
                      )}
                    </div>
                  </div>
                  <div className="som-board-note">{MEASURE_NOTE[measure]}</div>
                  {derived.board[measure].map((row, i) => {
                    const isYou = row.brand === yourBrand;
                    const rankClass = isYou ? 'your' : `rank-${Math.min(i + 1, 5)}`;
                    const noData = measure === 'sentiment' && row.n === 0;
                    return (
                      <div key={row.brand} className="som-lolli-row">
                        <div className={`som-lolli-name${isYou ? ' your' : ''}`}>{row.brand}</div>
                        <div className="som-lolli-track">
                          <div className="som-lolli-base" />
                          <div className={`som-lolli-stem${isYou ? ' your' : ''}`} data-w={row.value} style={{ width: 0 }} />
                          <div className={`som-lolli-dot ${rankClass}`} data-x={row.value} style={{ left: 0 }} />
                        </div>
                        <div className="som-lolli-val">
                          <div className={`som-lolli-pct${isYou ? ' your' : ''}`}>{noData ? '—' : `${row.value}%`}</div>
                          <div className="som-lolli-sub">{row.sub}</div>
                        </div>
                      </div>);

                  })}
                  <div className="som-scribble" style={{ top: '-30px', right: '40px' }}>
                    <span className="lbl">compare 3 ways</span>
                    <svg width="50" height="34" viewBox="0 0 50 34" aria-hidden="true">
                      <path d="M6 6 C 2 22, 16 30, 44 30" fill="none" stroke="#ee5530" strokeWidth="2.6" strokeLinecap="round" />
                      <path d="M34 30 L46 31 L41 19" fill="none" stroke="#ee5530" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div className="som-prompts-block">
                  <div className="som-bars-h">PROMPT-BY-PROMPT <em>breakdown</em></div>
                  {results.map((r, i) => {
                    const yc = r.mentions[yourBrand];
                    const yr = Math.round(yc / r.reps * 100);
                    const tier = yr >= 60 ? 'high' : yr >= 30 ? 'mid' : 'low';
                    const lbl = yr >= 60 ? 'STRONG' : yr >= 30 ? 'MODERATE' : 'WEAK';
                    const open = !!openPR[i];
                    return (
                      <div key={i} className="som-prompt-result">
                        <div className="som-prompt-result-head" role="button" tabIndex={0} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} details for prompt: ${r.prompt}`} onClick={() => setOpenPR((prev) => ({ ...prev, [i]: !prev[i] }))} onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();setOpenPR((prev) => ({ ...prev, [i]: !prev[i] }));}}}>
                          <div className="som-prompt-result-text">{r.prompt}</div>
                          <div className={`som-score-badge ${tier}`}>{yr}% · {lbl}</div>
                          <span className={`som-chev${open ? ' open' : ''}`}>▾</span>
                        </div>
                        {open &&
                        <div className="som-prompt-result-body">
                            <div className="som-brand-grid">
                              {derived.allBrands.map((b) => {
                              const c = r.mentions[b];
                              const rate = Math.round(c / r.reps * 100);
                              const ment = c >= Math.ceil(r.reps / 2);
                              return (
                                <div key={b} className={`som-brand-cell${ment ? ' mentioned' : ''}`}>
                                    <span>{b}</span>
                                    <span className="pct">{rate}% {ment ? '✓' : '○'}</span>
                                  </div>);

                            })}
                            </div>
                          </div>
                        }
                      </div>);

                  })}
                </div>

                <div className="som-insights">
                  <div className="som-insight-col wins">
                    <h3>✓ STRENGTHS</h3>
                    <ul>{derived.wins.map((w, i) => <li key={i} dangerouslySetInnerHTML={{ __html: w }} />)}</ul>
                  </div>
                  <div className="som-insight-col gaps">
                    <h3>→ GAPS TO CLOSE</h3>
                    <ul>{derived.gaps.map((g, i) => <li key={i} dangerouslySetInnerHTML={{ __html: g }} />)}</ul>
                  </div>
                </div>

                <div className="som-method">
                  <strong>METHODOLOGY</strong>
                  Every prompt runs live against Claude (the model wired into this page). A brand counts as <em>mentioned</em> when it appears in the answer; <em>first-mention</em> tracks who gets named first; <em>sentiment</em> reads the tone toward each brand. <strong style={{ display: 'inline', fontFamily: 'var(--som-mono)', fontSize: 13 }}>Share of Model = (mentions ÷ total queries) × 100.</strong> Inputs and your last read are saved in this browser — re-run weekly and the hero shows the trend versus your previous run.
                </div>

                <div className="som-actions">
                  <button className="som-btn yellow" aria-label="Export results as CSV" onClick={exportCSV}>↓ EXPORT CSV</button>
                  <button className="som-btn mint" aria-label="Copy report to clipboard" onClick={copyReport}>⎘ COPY REPORT</button>
                  <button className="som-btn" aria-label="Print results" onClick={() => window.print()}>⎙ PRINT</button>
                  <button className="som-btn ghost" aria-label="Reset and start a new analysis" onClick={reset} style={{ marginLeft: 'auto' }}>↺ NEW ANALYSIS</button>
                </div>
              </div>
              }

            {!results &&
              <div className="som-stage-nav">
                <button className="som-btn ghost" onClick={() => goStage(2)}>← BACK TO PROMPTS</button>
              </div>
              }
          </div>
            }
        </div>{/* som-shell-body */}
        </div>{/* som-shell */}
      </div>
    </section>);

};

window.ShareOfModelTool = ShareOfModelTool;

export default ShareOfModelTool;
