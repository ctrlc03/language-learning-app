'use client';

import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import type {
  Conversation,
  ChatMessage,
  MessageMetadata,
  Language,
  DifficultyLevel,
} from '@/types';
import { useStorage } from '@/contexts/StorageContext';
import { CHAT_STREAM_ERROR_MARKER } from '@/lib/claude/chat-stream';
import { StorageKeys } from '@/lib/storage/interface';
import { findScenario } from '@/lib/chat/scenarios';

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
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadConversation = useCallback(
    async (id: string) => {
      const conv = await storage.get<Conversation>(StorageKeys.conversation(id));
      if (conv) {
        setError(null);
        setConversation(conv);
      }
      return conv;
    },
    [storage],
  );

  /**
   * Ask the model to answer `conv` and stream the reply into state. `conv` ends with
   * the user's message, or is empty when the AI opens a role-play. Failures are shown via
   * `error` and never written to history, so the user's message stays and can be retried.
   */
  const requestReply = useCallback(
    async (conv: Conversation) => {
      setError(null);
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
            messages: conv.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            language: conv.language,
            difficulty: conv.difficulty,
            scenarioId: conv.scenarioId,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `The chat request failed (HTTP ${response.status}).`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('The server sent no reply. Please try again.');

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullContent += decoder.decode(value, { stream: true });

          // Update conversation with streaming content (a mid-stream error trailer is not text)
          const { text: parsedText } = parseMetadata(
            fullContent.split(CHAT_STREAM_ERROR_MARKER)[0],
          );
          assistantMessage.content = parsedText;

          setConversation({
            ...conv,
            messages: [...conv.messages, { ...assistantMessage }],
            updatedAt: Date.now(),
          });
        }

        const errorAt = fullContent.indexOf(CHAT_STREAM_ERROR_MARKER);
        if (errorAt !== -1) {
          throw new Error(fullContent.slice(errorAt + CHAT_STREAM_ERROR_MARKER.length));
        }

        // Final parse with metadata
        const { text: finalText, metadata } = parseMetadata(fullContent);
        if (!finalText) throw new Error('The AI returned an empty reply. Please try again.');
        assistantMessage.content = finalText;
        assistantMessage.metadata = metadata;

        const finalConv: Conversation = {
          ...conv,
          messages: [...conv.messages, assistantMessage],
          updatedAt: Date.now(),
        };

        setConversation(finalConv);
        await storage.set(StorageKeys.conversation(finalConv.id), finalConv);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;

        // Drop any partial reply; the stored conversation already ends with the user's message.
        setConversation(conv);
        setError(
          err instanceof TypeError
            ? 'Could not reach the server. Check your connection and try again.'
            : err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again.',
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [storage],
  );

  /**
   * Start a conversation. A lesson role-play has the AI speak first, so its opening line
   * is requested straight away (no learner message; the server adds a hidden prompt).
   */
  const createConversation = useCallback(
    async (language: Language, difficulty: DifficultyLevel, scenarioId?: string) => {
      const spec = scenarioId ? findScenario(scenarioId) : undefined;
      const conv: Conversation = {
        id: nanoid(),
        language,
        difficulty,
        scenarioId: spec ? scenarioId : undefined,
        title: spec?.kind === 'roleplay' ? spec.rolePlay.title : 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await storage.set(StorageKeys.conversation(conv.id), conv);
      setError(null);
      setConversation(conv);
      if (spec?.kind === 'roleplay') void requestReply(conv);
      return conv;
    },
    [storage, requestReply],
  );

  /** Tick or untick one of a role-play's goals. */
  const toggleGoal = useCallback(
    async (index: number) => {
      if (!conversation) return;
      const done = new Set(conversation.goalsDone ?? []);
      if (!done.delete(index)) done.add(index);
      const next: Conversation = { ...conversation, goalsDone: [...done].sort((a, b) => a - b) };
      setConversation(next);
      await storage.set(StorageKeys.conversation(next.id), next);
    },
    [conversation, storage],
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
      await requestReply(updatedConv);
    },
    [conversation, isStreaming, requestReply, storage],
  );

  /** Re-ask after a failed request: for the last user message, or for a role-play's opening line. */
  const retry = useCallback(async () => {
    if (!conversation || isStreaming) return;
    const last = conversation.messages[conversation.messages.length - 1];
    const opening = !last && findScenario(conversation.scenarioId ?? '')?.kind === 'roleplay';
    if (last?.role !== 'user' && !opening) return;
    await requestReply(conversation);
  }, [conversation, isStreaming, requestReply]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    conversation,
    isStreaming,
    error,
    createConversation,
    loadConversation,
    sendMessage,
    toggleGoal,
    retry,
    stopStreaming,
    setConversation,
  };
}
