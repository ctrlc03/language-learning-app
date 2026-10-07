'use client';

import { useState } from 'react';
import type { ToneIdItem } from '@/lib/tones/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToneIdentify } from '@/components/tones/tone-identify';
import { cn } from '@/lib/utils';

/** One "which tone did you hear?" item inside a session queue. */
export function ToneStep({
  item,
  onComplete,
  onNext,
}: {
  item: ToneIdItem;
  onComplete: (correct: boolean) => void;
  onNext: () => void;
}) {
  const [answered, setAnswered] = useState(false);
  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <Badge variant="outline" className="text-[11px]">
          Tones
        </Badge>
        <ToneIdentify
          item={item}
          onComplete={(correct) => {
            setAnswered(true);
            onComplete(correct);
          }}
        />
        <Button
          className={cn('w-full', !answered && 'opacity-50')}
          disabled={!answered}
          onClick={onNext}
        >
          Next →
        </Button>
      </CardContent>
    </Card>
  );
}
