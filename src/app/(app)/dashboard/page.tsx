'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProgress } from '@/hooks/use-progress';
import { useSRS } from '@/hooks/use-srs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLanguageName, getLanguageNativeName } from '@/lib/language/utils';
import type { FlashcardDeck } from '@/types';

export default function DashboardPage() {
  const { language, difficulty } = useLanguage();
  const { progress, todayActivity, loading: progressLoading } = useProgress();
  const { decks, loading: srsLoading } = useSRS();
  const [totalDue, setTotalDue] = useState(0);

  const languageDecks = decks.filter(d => d.language === language);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold">
          {language === 'chinese' ? '你好！' : 'こんにちは！'} Welcome back
        </h1>
        <p className="text-muted-foreground mt-1">
          Learning {getLanguageName(language)} ({getLanguageNativeName(language)}) · {difficulty} level
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">
              {progress.streak}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success">
              {todayActivity?.reviews ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Reviews Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-accent">
              {todayActivity?.exercises ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Exercises Done</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-foreground">
              {todayActivity?.conversationMessages ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Messages Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/chat" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                Start a Conversation
              </Button>
            </Link>
            <Link href="/exercises" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
                Do Exercises
              </Button>
            </Link>
            <Link href="/listening" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
                Listening Practice
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Flashcard Decks</CardTitle>
              <Link href="/flashcards">
                <Badge>View All</Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {languageDecks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No decks yet</p>
                <Link href="/flashcards" className="block mt-2">
                  <Button variant="outline" size="sm">Create Your First Deck</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {languageDecks.slice(0, 3).map(deck => (
                  <Link
                    key={deck.id}
                    href={`/flashcards?deck=${deck.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{deck.name}</p>
                      <p className="text-xs text-muted-foreground">{deck.cardCount} cards</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's accuracy */}
      {todayActivity && todayActivity.totalAnswers > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Today&apos;s Accuracy</p>
                <p className="text-xs text-muted-foreground">
                  {todayActivity.correctAnswers} / {todayActivity.totalAnswers} correct
                </p>
              </div>
              <p className="text-2xl font-bold text-primary">
                {Math.round((todayActivity.correctAnswers / todayActivity.totalAnswers) * 100)}%
              </p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${(todayActivity.correctAnswers / todayActivity.totalAnswers) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
