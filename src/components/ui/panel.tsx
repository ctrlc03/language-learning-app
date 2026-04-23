'use client';

import { cn } from '@/lib/utils';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tag?: string;
  meta?: string;
  glow?: 'pink' | 'cyan' | 'lime' | 'amber';
  children: React.ReactNode;
}

const glowClass: Record<string, string> = {
  pink: 'neon-glow-pink',
  cyan: 'neon-glow-cyan',
  lime: 'neon-glow-lime',
  amber: 'neon-glow-amber',
};

export function Panel({ tag, meta, glow, className, children, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'panel-corners relative border border-border bg-card backdrop-blur-sm',
        glow && glowClass[glow],
        className,
      )}
      {...props}
    >
      {/* Corner decorations */}
      <span className="panel-corner panel-corner-tl" />
      <span className="panel-corner panel-corner-tr" />
      <span className="panel-corner panel-corner-bl" />
      <span className="panel-corner panel-corner-br" />

      {(tag || meta) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-[10px] tracking-[0.2em] text-muted-foreground">
            {tag && <span className="text-primary font-medium">{tag}</span>}
          </span>
          {meta && (
            <span className="text-[10px] tracking-[0.2em] text-muted-foreground">{meta}</span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
