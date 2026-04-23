'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');

  return (
    <div className="text-right font-mono tabular-nums">
      <div className="font-display text-lg font-bold tracking-wide text-foreground">
        {hh}:{mm}<span className="opacity-40">:{ss}</span>
      </div>
      <div className="text-[10px] tracking-[0.15em] text-muted-foreground">
        SESSION {Math.floor(time.getTime() / 1000) % 100000}
      </div>
    </div>
  );
}
