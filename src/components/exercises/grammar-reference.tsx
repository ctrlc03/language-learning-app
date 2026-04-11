'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { chineseGrammarRules } from '@/data/chinese/grammar';
import { cn } from '@/lib/utils';

interface GrammarReferenceProps {
  onBack: () => void;
}

export function GrammarReference({ onBack }: GrammarReferenceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Grammar Patterns</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {chineseGrammarRules.length} patterns from your lessons
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {chineseGrammarRules.map(rule => {
          const open = expandedId === rule.id;
          return (
            <button
              key={rule.id}
              onClick={() => toggle(rule.id)}
              className="w-full text-left"
            >
              <Card className={cn(
                'p-3.5 transition-all',
                open
                  ? 'border-primary/40 bg-primary/[0.03]'
                  : 'hover:border-primary/30 hover:bg-primary/[0.02]'
              )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {rule.title}
                      <span className="text-muted-foreground font-normal ml-1.5">{rule.titleChinese}</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{rule.pattern}</p>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0">{open ? '▲' : '▼'}</span>
                </div>

                {open && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-3" onClick={e => e.stopPropagation()}>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rule.explanation}</p>
                    <div className="space-y-2">
                      {rule.examples.map((ex, i) => (
                        <div key={i} className="bg-muted/50 rounded-lg px-3 py-2 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{ex.chinese}</p>
                            <SpeakButton text={ex.chinese} size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground">{ex.pinyin}</p>
                          <p className="text-xs">{ex.english}</p>
                          {ex.note && (
                            <Badge variant="outline" className="text-[9px] mt-1">{ex.note}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
