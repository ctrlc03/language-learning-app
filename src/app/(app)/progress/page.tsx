'use client';

import { useMastery } from '@/hooks/use-mastery';
import { Card, CardContent } from '@/components/ui/card';
import { weakest, byGroup, type MasteryMap } from '@/lib/mastery';

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
}: {
  title: string;
  cjk: string;
  map: MasteryMap;
  emptyHint: string;
}) {
  const groups = byGroup(map);
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
                        title={`${w.correct}/${w.seen} correct`}
                      >
                        <span className="cjk text-lg">{w.label}</span>
                        {w.sublabel && (
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
  const tones = useMastery('tones');
  const writing = useMastery('writing');
  const classifiers = useMastery('classifiers');

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

      <DomainSection
        title="Tones"
        cjk="声"
        map={tones.map}
        emptyHint="Do some tone drills and your weakest tones and pairs will show up here."
      />
      <DomainSection
        title="Characters"
        cjk="書"
        map={writing.map}
        emptyHint="Practise writing and the characters you miss most will appear here."
      />
      <DomainSection
        title="Measure words"
        cjk="量"
        map={classifiers.map}
        emptyHint="Run the classifier drill to see which measure words trip you up."
      />
    </div>
  );
}
