'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { speak, speakEnglish, stopSpeaking } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { chineseDialogues } from '@/data/chinese/dialogues';
import lessonsData from '@/data/chinese/lessons.json';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { Dialogue } from '@/data/chinese/dialogues';

interface DialogueBrowserProps {
  language: Language;
  onBack: () => void;
}

const SPEAKER_COLORS = [
  'text-blue-600 dark:text-blue-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-purple-600 dark:text-purple-400',
  'text-amber-600 dark:text-amber-400',
];

function groupByLesson(): { lesson: number; title: string; titleChinese: string; dialogues: Dialogue[] }[] {
  const lessonMap = new Map<number, Dialogue[]>();
  for (const d of chineseDialogues) {
    if (!lessonMap.has(d.lesson)) lessonMap.set(d.lesson, []);
    lessonMap.get(d.lesson)!.push(d);
  }

  return lessonsData.lessons
    .filter(l => lessonMap.has(l.lesson))
    .map(l => ({
      lesson: l.lesson,
      title: l.title,
      titleChinese: l.titleChinese,
      dialogues: lessonMap.get(l.lesson)!,
    }));
}

export function DialogueBrowser({ language, onBack }: DialogueBrowserProps) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  if (language !== 'chinese') {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
        <p className="text-sm text-muted-foreground">Dialogues are currently available for Chinese only.</p>
      </div>
    );
  }

  const groups = groupByLesson();

  // Lesson picker
  if (selectedLesson === null) {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Dialogues</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Read and listen to full conversations</p>
          </div>
        </div>

        <div className="space-y-2">
          {groups.map(g => (
            <button
              key={g.lesson}
              onClick={() => setSelectedLesson(g.lesson)}
              className="w-full text-left"
            >
              <Card className="p-3.5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {g.title}
                      <span className="text-muted-foreground font-normal ml-1.5">{g.titleChinese}</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {g.dialogues.length} dialogue{g.dialogues.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">L{g.lesson}</Badge>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* All dialogues option */}
        <button
          onClick={() => setSelectedLesson(-1)}
          className="w-full text-left"
        >
          <Card className="p-3.5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all border-dashed">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">All Dialogues</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {chineseDialogues.length} dialogues across all lessons
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">All</Badge>
            </div>
          </Card>
        </button>
      </div>
    );
  }

  // Full-page dialogue view
  const selectedGroup = selectedLesson === -1
    ? { title: 'All Dialogues', titleChinese: '所有对话', dialogues: chineseDialogues }
    : groups.find(g => g.lesson === selectedLesson);

  if (!selectedGroup) {
    setSelectedLesson(null);
    return null;
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSelectedLesson(null)}>&larr; Back</Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{selectedGroup.title}</h1>
          <p className="text-muted-foreground text-xs">{selectedGroup.titleChinese}</p>
        </div>
      </div>

      {/* Sticky controls */}
      <div className="flex gap-2 sticky top-0 z-10 bg-background py-2">
        <button
          onClick={() => setShowPinyin(v => !v)}
          className={cn(
            'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
            showPinyin
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          Pinyin {showPinyin ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setShowTranslation(v => !v)}
          className={cn(
            'text-[11px] px-2.5 py-1 rounded-full border transition-colors',
            showTranslation
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/30'
          )}
        >
          Translation {showTranslation ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* All dialogues rendered inline */}
      <div className="space-y-8">
        {selectedGroup.dialogues.map(dialogue => (
          <DialogueCard
            key={dialogue.id}
            dialogue={dialogue}
            showPinyin={showPinyin}
            showTranslation={showTranslation}
          />
        ))}
      </div>
    </div>
  );
}

function DialogueCard({
  dialogue,
  showPinyin,
  showTranslation,
}: {
  dialogue: Dialogue;
  showPinyin: boolean;
  showTranslation: boolean;
}) {
  const { language, speechRate } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const cancelledRef = useRef(false);

  const handleListenAll = useCallback(async () => {
    cancelledRef.current = false;
    setPlaying(true);
    for (let i = 0; i < dialogue.lines.length; i++) {
      if (cancelledRef.current) break;
      setPlayingIndex(i);
      try {
        await speak(dialogue.lines[i].text, language, speechRate);
      } catch { /* skip */ }
      if (cancelledRef.current) break;
      if (showTranslation) {
        try {
          await speakEnglish(dialogue.lines[i].translation, speechRate);
        } catch { /* skip */ }
        if (cancelledRef.current) break;
      }
      if (!cancelledRef.current) {
        await new Promise(r => setTimeout(r, 600));
      }
    }
    setPlaying(false);
    setPlayingIndex(-1);
  }, [dialogue.lines, language, speechRate, showTranslation]);

  const handleStop = useCallback(() => {
    cancelledRef.current = true;
    stopSpeaking();
    setPlaying(false);
    setPlayingIndex(-1);
  }, []);

  const speakers = [...new Set(dialogue.lines.map(l => l.speaker))];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Dialogue header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm">
              {dialogue.title}
              <span className="text-muted-foreground font-normal ml-1.5">{dialogue.titleChinese}</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{dialogue.setting}</p>
          </div>
          <button
            onClick={() => playing ? handleStop() : handleListenAll()}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 shrink-0',
              playing
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : 'border-border text-muted-foreground hover:border-primary/30'
            )}
          >
            {playing ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                </svg>
                Listen
              </>
            )}
          </button>
        </div>

        {/* All lines visible */}
        <div className="space-y-2">
          {dialogue.lines.map((line, i) => {
            const speakerIndex = speakers.indexOf(line.speaker);
            const colorClass = SPEAKER_COLORS[speakerIndex % SPEAKER_COLORS.length];

            return (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2 group py-1 px-2 rounded-lg transition-all',
                  playingIndex === i && 'bg-primary/5 ring-1 ring-primary/30'
                )}
              >
                <SpeakButton text={line.text} size="icon" className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <span className={cn('text-[11px] font-semibold', colorClass)}>{line.speaker}</span>
                  <p className="text-sm font-medium">{line.text}</p>
                  {showPinyin && (
                    <p className="text-xs text-muted-foreground">{line.pinyin}</p>
                  )}
                  {showTranslation && (
                    <p className="text-xs text-muted-foreground/70 italic">{line.translation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
