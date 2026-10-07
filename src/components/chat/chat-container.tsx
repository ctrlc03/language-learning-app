'use client';

import { useEffect, useRef } from 'react';
import type { Conversation } from '@/types';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { RolePlayBrief } from './role-play-brief';
import { getRolePlay, getRolePlayDialogue } from '@/lib/chat/scenarios';

interface ChatContainerProps {
  conversation: Conversation | null;
  isStreaming: boolean;
  error: string | null;
  onSend: (message: string) => void;
  onRetry: () => void;
  onToggleGoal: (index: number) => void;
  /** Opens Script mode for the conversation's role-play. */
  onScript: () => void;
}

export function ChatContainer({
  conversation,
  isStreaming,
  error,
  onSend,
  onRetry,
  onToggleGoal,
  onScript,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages, error]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Start a new conversation to begin learning!</p>
      </div>
    );
  }

  const rolePlay = getRolePlay(conversation.scenarioId);
  const canScript = rolePlay !== undefined && getRolePlayDialogue(rolePlay) !== undefined;

  return (
    <div className="flex flex-col h-full">
      {rolePlay && (
        <RolePlayBrief
          rolePlay={rolePlay}
          messages={conversation.messages}
          goalsDone={conversation.goalsDone ?? []}
          onToggleGoal={onToggleGoal}
          onScript={canScript ? onScript : undefined}
          goalsDisabled={isStreaming}
        />
      )}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 && !rolePlay && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg font-medium">
              {conversation.language === 'chinese' ? '你好！' : 'こんにちは！'}
            </p>
            <p className="text-sm mt-1">
              Start chatting to practice your{' '}
              {conversation.language === 'chinese' ? 'Chinese' : 'Japanese'}!
            </p>
          </div>
        )}

        {rolePlay && conversation.messages.length === 0 && !isStreaming && !error && (
          <div className="text-center text-muted-foreground py-12 space-y-3">
            <p className="text-sm">The AI plays {rolePlay.aiRole} and speaks first.</p>
            <Button type="button" size="sm" onClick={onRetry}>
              Start the role-play
            </Button>
          </div>
        )}

        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isStreaming && (
          <div className="flex gap-2 items-center text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              AI
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <p className="min-w-0 break-words">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="shrink-0"
            >
              Retry
            </Button>
          </div>
        )}

        {error && canScript && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-3 text-sm space-y-2">
            <p className="font-medium">Can’t reach the AI? Practise this scene offline.</p>
            <p className="text-muted-foreground">
              Script mode plays the lesson dialogue with you: the app speaks one role, you type or
              say the other. It needs no network or API key.
            </p>
            <Button type="button" size="sm" onClick={onScript}>
              Start Script mode
            </Button>
          </div>
        )}
      </div>

      <ChatInput
        onSend={onSend}
        disabled={isStreaming}
        placeholder={
          conversation.language === 'chinese'
            ? 'Type in Chinese or English...'
            : 'Type in Japanese or English...'
        }
      />
    </div>
  );
}
