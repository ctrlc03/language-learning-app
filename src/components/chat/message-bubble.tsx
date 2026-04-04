'use client';

import type { ChatMessage } from '@/types';
import { SpeakButton } from '@/components/shared/speak-button';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  showSpeaker?: boolean;
}

export function MessageBubble({ message, showSpeaker = true }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2 group', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium shrink-0 mt-1">
          AI
        </div>
      )}

      <div className={cn('max-w-[80%] space-y-1')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Metadata (corrections, vocab) */}
        {message.metadata && (
          <div className="space-y-2 px-1">
            {message.metadata.corrections && message.metadata.corrections.length > 0 && (
              <div className="text-xs space-y-1">
                {message.metadata.corrections.map((correction, i) => (
                  <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                    <span className="line-through text-destructive/70">{correction.original}</span>
                    {' → '}
                    <span className="text-success font-medium">{correction.corrected}</span>
                    <p className="text-muted-foreground mt-0.5">{correction.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {message.metadata.vocabulary && message.metadata.vocabulary.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {message.metadata.vocabulary.map((vocab, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs bg-primary/5 text-primary border border-primary/20 rounded-full px-2 py-0.5"
                  >
                    {vocab.word}
                    <span className="text-muted-foreground">({vocab.meaning})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isUser && showSpeaker && message.content && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <SpeakButton text={message.content} size="sm" />
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-sm font-medium shrink-0 mt-1">
          You
        </div>
      )}
    </div>
  );
}
