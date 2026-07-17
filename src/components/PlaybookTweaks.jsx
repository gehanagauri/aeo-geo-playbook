import React from 'react';
import {
  useTweaks, TweaksPanel, TweakSection, TweakSelect, TweakSlider, TweakRadio,
} from './TweaksPanel.jsx';

// Theme tokens for each tweak option, plus the React app that mounts <TweaksPanel>.

const PALETTES = {
  pop: {
    label: 'Pop art',
    ink: '#0A0A0A', paper: '#ffffff',
    c1: '#ef3333', c2: '#8baaff', c3: '#a9e1c6', c4: '#ffd95c', c5: '#FFB5C5',
  },
  muted: {
    label: 'Muted',
    ink: '#2A2522', paper: '#F4EFE6',
    c1: '#C26A4E', c2: '#5A7FA8', c3: '#9BB89A', c4: '#D9B86A', c5: '#D2A4AC',
  },
  pastel: {
    label: 'Pastel',
    ink: '#3A3340', paper: '#FBF6F1',
    c1: '#F4A99A', c2: '#A8C0E0', c3: '#C7E5C4', c4: '#F4DC9A', c5: '#F2C8D0',
  },
  dusk: {
    label: 'Dusk',
    ink: '#241F2B', paper: '#EFE9E0',
    c1: '#B8584A', c2: '#4D688C', c3: '#82A38B', c4: '#C9A35E', c5: '#B98C9A',
  },
  mono: {
    label: 'Mono',
    ink: '#1B1B1B', paper: '#F2EFEA',
    c1: '#1B1B1B', c2: '#5A5A5A', c3: '#A4A09A', c4: '#D4CFC4', c5: '#E8E3DA',
  },
};

const TYPESETS = {
  bold: {
    label: 'Bold (original)',
    display: '"Archivo Black", sans-serif',
    accent:  '"Fraunces", serif',
    body:    '"Space Grotesk", sans-serif',
    displayTracking: '-0.005em',
    displayLeading: '0.85',
  },
  flowy: {
    label: 'Flowy serif',
    display: '"Fraunces", serif',
    accent:  '"Instrument Serif", serif',
    body:    '"DM Sans", sans-serif',
    displayTracking: '-0.025em',
    displayLeading: '0.92',
  },
  editorial: {
    label: 'Editorial',
    display: '"Playfair Display", serif',
    accent:  '"Instrument Serif", serif',
    body:    '"Inter", sans-serif',
    displayTracking: '-0.02em',
    displayLeading: '0.95',
  },
  modern: {
    label: 'Modern sans',
    display: '"Space Grotesk", sans-serif',
    accent:  '"Fraunces", serif',
    body:    '"Inter", sans-serif',
    displayTracking: '-0.03em',
    displayLeading: '0.9',
  },
};

const SHAPES = {
  boxy:   { label: 'Boxy',   radius: 0,  radiusSm: 0,  radiusLg: 0  },
  soft:   { label: 'Soft',   radius: 12, radiusSm: 8,  radiusLg: 22 },
  rounded:{ label: 'Rounded',radius: 22, radiusSm: 14, radiusLg: 32 },
  flowy:  { label: 'Flowy',  radius: 36, radiusSm: 22, radiusLg: 60 },
};

const SHADOW_STYLES = {
  hard:   { x: 6, y: 6, blur: 0,  color: 'var(--c-ink)' },
  soft:   { x: 4, y: 6, blur: 14, color: 'rgba(42,37,34,0.18)' },
  glow:   { x: 0, y: 8, blur: 24, color: 'rgba(42,37,34,0.14)' },
  none:   { x: 0, y: 0, blur: 0,  color: 'transparent' },
};

function applyTheme(t) {
  const r = document.documentElement;
  const p = PALETTES[t.palette] || PALETTES.pop;
  r.style.setProperty('--c-ink', p.ink);
  r.style.setProperty('--c-paper', p.paper);
  r.style.setProperty('--c-1', p.c1);
  r.style.setProperty('--c-2', p.c2);
  r.style.setProperty('--c-3', p.c3);
  r.style.setProperty('--c-4', p.c4);
  r.style.setProperty('--c-5', p.c5);

  const ts = TYPESETS[t.typeset] || TYPESETS.bold;
  r.style.setProperty('--font-display', ts.display);
  r.style.setProperty('--font-accent',  ts.accent);
  r.style.setProperty('--font-body',    ts.body);
  r.style.setProperty('--display-tracking', ts.displayTracking);
  r.style.setProperty('--display-leading',  ts.displayLeading);

  const sh = SHAPES[t.shape] || SHAPES.boxy;
  const radiusScale = t.shape === 'flowy' ? 1 : 1;
  r.style.setProperty('--radius',    sh.radius + 'px');
  r.style.setProperty('--radius-sm', sh.radiusSm + 'px');
  r.style.setProperty('--radius-lg', sh.radiusLg + 'px');

  // Border weight 1.5 → 5
  r.style.setProperty('--bw-2', (Number(t.borderWeight) || 3) + 'px');
  r.style.setProperty('--bw-3', ((Number(t.borderWeight) || 3) + 1) + 'px');

  const sd = SHADOW_STYLES[t.shadowStyle] || SHADOW_STYLES.hard;
  r.style.setProperty('--shadow-x', sd.x + 'px');
  r.style.setProperty('--shadow-y', sd.y + 'px');
  r.style.setProperty('--shadow-blur', sd.blur + 'px');
  r.style.setProperty('--shadow-color', sd.color);

  // Display scale (multiplier for big headers)
  r.style.setProperty('--display-scale', String(t.displayScale ?? 1));
}

const PlaybookTweaks = () => {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  React.useEffect(() => { applyTheme(t); }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette" />
      <TweakSelect
        label="Color set"
        value={t.palette}
        options={Object.entries(PALETTES).map(([k,v]) => ({ value: k, label: v.label }))}
        onChange={(v) => setTweak('palette', v)}
      />

      <TweakSection label="Typography" />
      <TweakSelect
        label="Type system"
        value={t.typeset}
        options={Object.entries(TYPESETS).map(([k,v]) => ({ value: k, label: v.label }))}
        onChange={(v) => setTweak('typeset', v)}
      />
      <TweakSlider
        label="Display scale"
        value={t.displayScale}
        min={0.7} max={1.2} step={0.05}
        onChange={(v) => setTweak('displayScale', v)}
      />

      <TweakSection label="Shape language" />
      <TweakRadio
        label="Corners"
        value={t.shape}
        options={[
          { value: 'boxy', label: 'Box' },
          { value: 'soft', label: 'Soft' },
          { value: 'rounded', label: 'Round' },
          { value: 'flowy', label: 'Flow' },
        ]}
        onChange={(v) => setTweak('shape', v)}
      />
      <TweakSlider
        label="Border weight"
        value={t.borderWeight}
        min={1} max={5} step={0.5} unit="px"
        onChange={(v) => setTweak('borderWeight', v)}
      />
      <TweakRadio
        label="Shadow"
        value={t.shadowStyle}
        options={[
          { value: 'hard', label: 'Hard' },
          { value: 'soft', label: 'Soft' },
          { value: 'glow', label: 'Glow' },
          { value: 'none', label: 'None' },
        ]}
        onChange={(v) => setTweak('shadowStyle', v)}
      />
    </TweaksPanel>
  );
};

// Apply once on first load, before React mounts, so initial paint matches.
applyTheme(window.TWEAK_DEFAULTS);

export default PlaybookTweaks;
