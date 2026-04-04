'use client';

import { useEffect, useRef } from 'react';
import type { Conversation } from '@/types';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';

interface ChatContainerProps {
  conversation: Conversation | null;
  isStreaming: boolean;
  onSend: (message: string) => void;
}

export function ChatContainer({ conversation, isStreaming, onSend }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Start a new conversation to begin learning!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg font-medium">
              {conversation.language === 'chinese' ? '你好！' : 'こんにちは！'}
            </p>
            <p className="text-sm mt-1">
              Start chatting to practice your {conversation.language === 'chinese' ? 'Chinese' : 'Japanese'}!
            </p>
          </div>
        )}

        {conversation.messages.map(message => (
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
