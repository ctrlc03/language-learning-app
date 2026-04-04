'use client';

import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { Conversation, ChatMessage, MessageMetadata, Language, DifficultyLevel } from '@/types';
import { useStorage } from '@/contexts/StorageContext';
import { StorageKeys } from '@/lib/storage/interface';

function parseMetadata(content: string): { text: string; metadata?: MessageMetadata } {
  const metaSplit = content.split('<!--META-->');
  if (metaSplit.length < 2) return { text: content.trim() };

  const text = metaSplit[0].trim();
  try {
    const metadata = JSON.parse(metaSplit[1].trim()) as MessageMetadata;
    return { text, metadata };
  } catch {
    return { text };
  }
}

export function useChat() {
  const storage = useStorage();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const createConversation = useCallback(
    async (language: Language, difficulty: DifficultyLevel, scenario?: string) => {
      const conv: Conversation = {
        id: nanoid(),
        language,
        difficulty,
        scenario,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await storage.set(StorageKeys.conversation(conv.id), conv);
      setConversation(conv);
      return conv;
    },
    [storage]
  );

  const loadConversation = useCallback(
    async (id: string) => {
      const conv = await storage.get<Conversation>(StorageKeys.conversation(id));
      if (conv) setConversation(conv);
      return conv;
    },
    [storage]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversation || isStreaming) return;

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
      };

      const updatedConv: Conversation = {
        ...conversation,
        messages: [...conversation.messages, userMessage],
        updatedAt: Date.now(),
      };

      // Update title from first message
      if (updatedConv.messages.length === 1) {
        updatedConv.title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
      }

      setConversation(updatedConv);
      await storage.set(StorageKeys.conversation(updatedConv.id), updatedConv);

      // Stream response
      setIsStreaming(true);
      abortRef.current = new AbortController();

      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      };

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedConv.messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            language: updatedConv.language,
            difficulty: updatedConv.difficulty,
            scenario: updatedConv.scenario,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error('Chat request failed');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          // Update conversation with streaming content
          const { text: parsedText } = parseMetadata(fullContent);
          assistantMessage.content = fullContent;

          const streamingConv: Conversation = {
            ...updatedConv,
            messages: [...updatedConv.messages, { ...assistantMessage, content: parsedText }],
            updatedAt: Date.now(),
          };
          setConversation(streamingConv);
        }

        // Final parse with metadata
        const { text: finalText, metadata } = parseMetadata(fullContent);
        assistantMessage.content = finalText;
        assistantMessage.metadata = metadata;

        const finalConv: Conversation = {
          ...updatedConv,
          messages: [...updatedConv.messages, assistantMessage],
          updatedAt: Date.now(),
        };

        setConversation(finalConv);
        await storage.set(StorageKeys.conversation(finalConv.id), finalConv);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        const errorMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: 'Sorry, there was an error. Please try again.',
          createdAt: Date.now(),
        };

        const errorConv: Conversation = {
          ...updatedConv,
          messages: [...updatedConv.messages, errorMessage],
          updatedAt: Date.now(),
        };
        setConversation(errorConv);
        await storage.set(StorageKeys.conversation(errorConv.id), errorConv);
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversation, isStreaming, storage]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    conversation,
    isStreaming,
    createConversation,
    loadConversation,
    sendMessage,
    stopStreaming,
    setConversation,
  };
}
