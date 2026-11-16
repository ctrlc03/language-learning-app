'use client';

import { SpeakButton } from '@/components/shared/speak-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ExplainedText } from '@/hooks/use-explain';

interface ExplanationCardProps {
  result: ExplainedText | null;
  loading: boolean;
  error: string | null;
}

/** The AI's explanation of what was written: what it means, a correction if it needs one, and notes. */
export function ExplanationCard({ result, loading, error }: ExplanationCardProps) {
  let body: React.ReactNode = null;
  if (loading) {
    body = <p className="text-sm text-muted-foreground">Explaining…</p>;
  } else if (error) {
    body = (
      <p
        role="alert"
        className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
      >
        {error}
      </p>
    );
  } else if (result) {
    const { text, explanation } = result;
    body = (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <p className="cjk min-w-0 flex-1 text-lg" lang="zh-CN">
            {text}
          </p>
          <Badge variant={explanation.correct ? 'success' : 'warning'}>
            {explanation.correct ? 'Looks right' : 'Needs a fix'}
          </Badge>
        </div>
        <p className="text-sm">
          <span className="text-muted-foreground">Meaning: </span>
          {explanation.translation}
        </p>
        {explanation.corrected && (
          <div className="border-l-2 border-success pl-3">
            <p className="text-xs text-muted-foreground">Corrected</p>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="cjk text-lg" lang="zh-CN">
                  {explanation.corrected}
                </p>
                <p className="text-sm text-primary">{explanation.correctedPinyin}</p>
              </div>
              <SpeakButton text={explanation.corrected} language="chinese" />
            </div>
          </div>
        )}
        {explanation.notes.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {explanation.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-5" aria-live="polite" aria-busy={loading}>
        <h2 className="font-semibold">
          Explanation<span className="cjk text-muted-foreground"> · 解释</span>
        </h2>
        {body}
      </CardContent>
    </Card>
  );
}
