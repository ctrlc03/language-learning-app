'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMastery } from '@/hooks/use-mastery';
import { useMistakes } from '@/hooks/use-mistakes';
import { Card, CardContent } from '@/components/ui/card';
import { buttonClassName } from '@/components/ui/button';
import { weakest, byGroup, type MasteryMap } from '@/lib/mastery';
import { cn, plural } from '@/lib/utils';

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

// Red → amber → green by accuracy, for the little accuracy chips/bars.
function accColor(acc: number): string {
  if (acc < 0.5) return '#d81e06';
  if (acc < 0.8) return '#f59e0b';
  return '#16a34a';
}

function DomainSection({
  title,
  cjk,
  map,
  emptyHint,
  textLabels = false,
  showGroups = true,
}: {
  title: string;
  cjk: string;
  map: MasteryMap;
  emptyHint: string;
  /** Labels are phrases (grammar pattern names) rather than characters: smaller, sublabel as tooltip. */
  textLabels?: boolean;
  /** Show per-group accuracy bars; off when every item shares one group, which would just repeat the title. */
  showGroups?: boolean;
}) {
  const groups = showGroups ? byGroup(map) : [];
  const weak = weakest(map, 12);
  const totalSeen = Object.values(map).reduce((n, e) => n + e.seen, 0);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="cjk text-2xl font-semibold">{cjk}</span>
          <h2 className="font-semibold">{title}</h2>
        </div>

        {totalSeen === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyHint}</p>
        ) : (
          <>
            {groups.length > 0 && (
              <div className="space-y-1.5">
                {groups.map((g) => (
                  <div key={g.group} className="flex items-center gap-3">
                    <span className="text-sm w-28 shrink-0 truncate cjk">{g.group}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: pct(g.acc), background: accColor(g.acc) }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {pct(g.acc)} · {g.seen}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Needs work
              </div>
              {weak.filter((w) => w.acc < 1).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All clear — nothing you&apos;re consistently missing.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {weak
                    .filter((w) => w.acc < 1)
                    .map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                        title={[textLabels && w.sublabel, `${w.correct}/${w.seen} correct`]
                          .filter(Boolean)
                          .join(' · ')}
                      >
                        <span className={cn('cjk', textLabels ? 'text-sm' : 'text-lg')}>
                          {w.label}
                        </span>
                        {w.sublabel && !textLabels && (
                          <span className="text-xs text-muted-foreground">{w.sublabel}</span>
                        )}
                        <span className="text-xs font-medium" style={{ color: accColor(w.acc) }}>
                          {pct(w.acc)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProgressPage() {
  const { language } = useLanguage();
  const chinese = language === 'chinese';
  const tones = useMastery('tones');
  const writing = useMastery('writing');
  const classifiers = useMastery('classifiers');
  const typing = useMastery('typing');
  const numbers = useMastery('numbers');
  const grammar = useMastery('grammar');
  const speaking = useMastery('speaking');
  const mistakes = useMistakes();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-top">
        <div>
          <div className="greet">弱点 · where to focus</div>
          <h1>
            Weak Spots<span className="cjk"> · 弱点</span>
          </h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <h2 className="font-semibold">Drill your weak spots</h2>
            <p className="text-xs text-muted-foreground">
              {[
                mistakes.open.length > 0 &&
                  `Retries your ${plural(mistakes.open.length, 'open mistake')}.`,
                chinese
                  ? 'Drills the grammar patterns and tones you miss most.'
                  : mistakes.open.length === 0 && 'Answers you miss in Practice come back here.',
              ]
                .filter(Boolean)
                .join(' ')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/mistakes" className={buttonClassName({ variant: 'outline' })}>
              Mistakes
            </Link>
            <Link href="/session/weak" className={buttonClassName()}>
              Drill these
            </Link>
          </div>
        </CardContent>
      </Card>

      <DomainSection
        title="Tones"
        cjk="声"
        map={tones.map}
        emptyHint="Do some tone drills and your weakest tones and pairs will show up here."
      />
      <DomainSection
        title="Characters"
        cjk={language === 'japanese' ? '書' : '写'}
        map={writing.map}
        emptyHint="Practise writing and the characters you miss most will appear here."
      />
      <DomainSection
        title="Measure words"
        cjk="量"
        map={classifiers.map}
        emptyHint="Run the classifier drill to see which measure words trip you up."
      />
      <DomainSection
        title="Pinyin typing"
        cjk="拼"
        map={typing.map}
        emptyHint="Type some pinyin and the words you spell wrong will show up here."
      />
      <DomainSection
        title="Numbers"
        cjk="数"
        map={numbers.map}
        emptyHint="Do the numbers drill to track numbers, money, and dates."
      />
      {chinese && (
        <DomainSection
          title="Grammar"
          cjk="语"
          map={grammar.map}
          textLabels
          showGroups={false}
          emptyHint="Study patterns in Learn or do the daily session, and the patterns you miss will show up here."
        />
      )}
      {chinese && (
        <DomainSection
          title="Speaking"
          cjk="说"
          map={speaking.map}
          emptyHint="Practise speaking and the sentences you find hard to say will show up here."
        />
      )}
    </div>
  );
}
