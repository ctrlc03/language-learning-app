'use client';

import { useState, useEffect } from 'react';

interface TweakState {
  motif: number;
  warmth: 'cool' | 'neutral' | 'warm';
  density: 'snug' | 'default' | 'airy';
}

const DEFAULTS: TweakState = { motif: 0.4, warmth: 'neutral', density: 'default' };

function applyTweaks(t: TweakState) {
  const root = document.documentElement.style;
  root.setProperty('--motif-opacity', String(t.motif));
  const dens: Record<string, string> = { snug: '0.94', default: '1', airy: '1.08' };
  document.querySelectorAll<HTMLElement>('.frame').forEach(f => {
    f.style.fontSize = `${dens[t.density] || 1}em`;
  });
  const warmth: Record<string, string> = { cool: '0.92', neutral: '1', warm: '1.06' };
  document.querySelectorAll<HTMLElement>('.app').forEach(a => {
    a.style.filter = `saturate(${warmth[t.warmth] || 1})`;
  });
}

export function Tweaks() {
  const [open, setOpen] = useState(false);
  const [tweaks, setTweaks] = useState<TweakState>(DEFAULTS);

  useEffect(() => {
    applyTweaks(tweaks);
  }, [tweaks]);

  const set = <K extends keyof TweakState>(k: K, v: TweakState[K]) =>
    setTweaks(prev => ({ ...prev, [k]: v }));

  return (
    <>
      <button
        className="icon-btn"
        aria-label="Tweaks"
        onClick={() => setOpen(o => !o)}
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9998 }}
      >
        調
      </button>

      <div className={`tweaks ${open ? 'open' : ''}`} style={{ bottom: 68 }}>
        <div className="h">
          <span>
            <span className="cjk">調</span> Tweaks
          </span>
          <button onClick={() => setOpen(false)} style={{ fontSize: 18, color: 'var(--ink-faint)' }}>
            ×
          </button>
        </div>
        <div className="b">
          <div className="row">
            <label>Motif intensity · {Math.round(tweaks.motif * 100)}%</label>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={tweaks.motif}
              onChange={e => set('motif', parseFloat(e.target.value))}
            />
          </div>
          <div className="row">
            <label>Card warmth</label>
            <div className="chips">
              {(['cool', 'neutral', 'warm'] as const).map(w => (
                <button key={w} className={tweaks.warmth === w ? 'on' : ''} onClick={() => set('warmth', w)}>
                  {w[0].toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="row">
            <label>Density</label>
            <div className="chips">
              {(['snug', 'default', 'airy'] as const).map(d => (
                <button key={d} className={tweaks.density === d ? 'on' : ''} onClick={() => set('density', d)}>
                  {d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
