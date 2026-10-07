'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMistakes } from '@/hooks/use-mistakes';
import { useSpeechInit } from '@/hooks/use-speech';
import { Card, CardContent } from '@/components/ui/card';
import { buttonClassName } from '@/components/ui/button';
import { MistakeRow } from '@/components/mistakes/mistake-row';
import { SOURCE_LABELS, type MistakeSource } from '@/lib/mistakes';
import { cn } from '@/lib/utils';

const SOURCE_ORDER: MistakeSource[] = ['practice', 'session', 'learn', 'lesson', 'reader'];

type Filter = 'all' | MistakeSource;

export default function MistakesPage() {
  const { language } = useLanguage();
  const { open, masteredCount, loading, dismiss } = useMistakes();
  const [filter, setFilter] = useState<Filter>('all');
  const [now] = useState(() => Date.now());

  useSpeechInit();

  const japanese = language === 'japanese';
  const sources = SOURCE_ORDER.filter((s) => open.some((m) => m.source === s));
  // A removed row can empty its source; fall back to All rather than show nothing.
  const active: Filter = filter !== 'all' && sources.includes(filter) ? filter : 'all';
  const visible = active === 'all' ? open : open.filter((m) => m.source === active);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-top">
        <div>
          <div className="greet">{japanese ? '間違いノート' : '错题本'} · mistakes to retry</div>
          <h1>
            Mistakes<span className="cjk"> · {japanese ? '間違い' : '错题'}</span>
          </h1>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading your mistakes…</p>
      ) : open.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <h2 className="text-lg font-semibold">Nothing to retry</h2>
            <p className="text-sm text-muted-foreground">
              {japanese
                ? 'Questions you miss in Practice and the daily Session collect here.'
                : 'Questions you miss in Practice, the daily Session, Learn, lesson self-checks and the Reader collect here.'}{' '}
              A mistake leaves the list after you answer it right two times in a row.
            </p>
            {masteredCount > 0 && (
              <p className="text-xs text-muted-foreground">{masteredCount} retired so far.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{open.length} open</span>
              {' · '}
              {masteredCount} retired
            </p>
            <Link href="/session/weak" className={buttonClassName()}>
              Retry mistakes
            </Link>
          </div>

          {sources.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by source">
              {(['all', ...sources] as Filter[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active === s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    'h-8 px-3 text-xs tracking-[0.1em] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                    active === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-muted',
                  )}
                >
                  <span>{s === 'all' ? 'All' : SOURCE_LABELS[s]}</span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {visible.map((m) => (
              <MistakeRow key={m.id} mistake={m} now={now} onRemove={dismiss} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
