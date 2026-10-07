'use client';

import { cn } from '@/lib/utils';
import type { Language } from '@/types';

/** Map the app's language to the design's per-world code. */
export function langCode(language: Language): 'jp' | 'zh' {
  return language === 'japanese' ? 'jp' : 'zh';
}

interface InkCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  cjk?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}

/** Paper card primitive with an optional brushed label header. */
export function InkCard({ title, cjk, meta, className, children, ...props }: InkCardProps) {
  return (
    <div className={cn('ink-card', className)} {...props}>
      {(title || meta) && (
        <div className="card-label">
          <div className="t">
            {cjk && <span className="cjk">{cjk}</span>}
            {title}
          </div>
          {meta && <div className="m">{meta}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Circular progress ring. */
export function Ring({
  value = 0,
  size = 56,
  stroke = 4,
  color = 'var(--primary)',
  track = 'var(--line)',
  label,
  title,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: React.ReactNode;
  /** Spoken description of what the ring measures, e.g. "40% of words reviewed". */
  title?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      role={title ? 'img' : undefined}
      aria-label={title}
      className="prog"
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value)}
          strokeLinecap="round"
        />
      </svg>
      {label !== undefined && (
        <span
          className="pct"
          style={{
            position: 'absolute',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--ink)',
            fontFamily: 'var(--serif)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function todayParts() {
  const d = new Date();
  return {
    weekday: WEEKDAYS[d.getDay()],
    month: MONTHS[d.getMonth()],
    day: d.getDate(),
    year: d.getFullYear(),
  };
}
