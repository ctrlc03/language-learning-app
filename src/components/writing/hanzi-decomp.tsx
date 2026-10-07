'use client';

import { useEffect, useState } from 'react';
import { ColoredPinyin } from '@/components/tones/tone-pieces';
import { getTones } from '@/lib/tones/utils';
import { loadDecomp, toneless, type DecompData } from '@/lib/writing/decomp';

/** Toneless reading of a single character, for the phonetic-hint comparison. */
function baseReading(char: string): string {
  const tones = getTones(char);
  return tones.length === 1 ? toneless(tones[0].text) : '';
}

interface HanziDecompProps {
  char: string;
  /** Jump to a sibling character (only called for chars in the study set). */
  onPickSibling?: (char: string) => void;
  inStudySet?: (char: string) => boolean;
}

export function HanziDecomp({ char, onPickSibling, inStudySet }: HanziDecompProps) {
  const [data, setData] = useState<DecompData | null>(null);

  useEffect(() => {
    let alive = true;
    loadDecomp().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  const entry = data?.chars[char];
  if (!entry) return null;

  const charBase = baseReading(char);

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground text-center">
        Components
      </div>

      <div className="space-y-3">
        {entry.components.map((comp) => {
          // A component that sounds like the whole character is likely the
          // phonetic part (妈 mā ← 马 mǎ); otherwise treat it as meaning.
          const isPhonetic = charBase !== '' && baseReading(comp.c) === charBase;
          const siblings = (data?.byComponent[comp.c] ?? []).filter((c) => c !== char).slice(0, 10);

          return (
            <div key={comp.c} className="rounded-xl border p-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl cjk leading-none">{comp.c}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ColoredPinyin word={comp.c} className="text-sm font-medium" />
                    <span
                      className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5"
                      style={{
                        background: isPhonetic ? '#f59e0b22' : '#16a34a22',
                        color: isPhonetic ? '#b45309' : '#15803d',
                      }}
                    >
                      {isPhonetic ? 'sound' : 'meaning'}
                    </span>
                  </div>
                  {comp.m && <div className="text-sm text-muted-foreground truncate">{comp.m}</div>}
                </div>
              </div>

              {siblings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[11px] text-muted-foreground self-center mr-1">
                    shares:
                  </span>
                  {siblings.map((s) => {
                    const jumpable = !!onPickSibling && (inStudySet?.(s) ?? false);
                    return (
                      <button
                        key={s}
                        disabled={!jumpable}
                        onClick={() => jumpable && onPickSibling?.(s)}
                        className={
                          'cjk text-lg rounded px-1.5 border ' +
                          (jumpable ? 'hover:bg-primary/5 cursor-pointer' : 'cursor-default')
                        }
                        title={jumpable ? `Practise ${s}` : undefined}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
