'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStorage } from '@/contexts/StorageContext';
import { useChat } from '@/hooks/use-chat';
import { useSpeechInit } from '@/hooks/use-speech';
import { ChatContainer } from '@/components/chat/chat-container';
import { ScenarioPicker, SCENARIOS } from '@/components/chat/scenario-picker';
import { Button } from '@/components/ui/button';
import { StoragePrefixes } from '@/lib/storage/interface';
import type { Conversation, ChatScenario } from '@/types';
import { cn, truncate, formatDate } from '@/lib/utils';

export default function ChatPage() {
  const { language, difficulty } = useLanguage();
  const storage = useStorage();
  const { conversation, isStreaming, createConversation, loadConversation, sendMessage } = useChat();
  const [showScenarios, setShowScenarios] = useState(true);
  const [pastConversations, setPastConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useSpeechInit();

  useEffect(() => {
    storage.query<Conversation>(
      StoragePrefixes.conversations,
      c => c.language === language
    ).then(convs => {
      setPastConversations(convs.sort((a, b) => b.updatedAt - a.updatedAt));
    });
  }, [language, storage, conversation]);

  const handleScenarioSelect = async (scenario: ChatScenario | null) => {
    await createConversation(
      language,
      difficulty,
      scenario?.systemPromptAddition
    );
    setShowScenarios(false);
  };

  const handleLoadConversation = async (id: string) => {
    await loadConversation(id);
    setShowScenarios(false);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    setShowScenarios(true);
    setShowHistory(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      {/* Conversation list sidebar (desktop) */}
      <div className={cn(
        'border-r border-border bg-card flex-col w-72',
        showHistory ? 'flex' : 'hidden md:flex'
      )}>
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Conversations</h2>
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            + New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pastConversations.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No conversations yet</p>
          )}
          {pastConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleLoadConversation(conv.id)}
              className={cn(
                'w-full text-left p-2.5 rounded-lg text-sm transition-colors',
                conversation?.id === conv.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <p className="font-medium truncate">{truncate(conv.title, 30)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(conv.updatedAt)} · {conv.messages.length} messages
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2 p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            History
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            + New Chat
          </Button>
        </div>

        {showScenarios && !conversation ? (
          <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto">
            <ScenarioPicker language={language} onSelect={handleScenarioSelect} />
          </div>
        ) : (
          <ChatContainer
            conversation={conversation}
            isStreaming={isStreaming}
            onSend={sendMessage}
          />
        )}
      </div>
    </div>
  );
}
