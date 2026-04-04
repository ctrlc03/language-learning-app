'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { speak, speakEnglish, stopSpeaking } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { chineseDialogues } from '@/data/chinese/dialogues';
import lessonsData from '@/data/chinese/lessons.json';
import { cn } from '@/lib/utils';
import type { Language, VocabularyItem } from '@/types';
import type { Dialogue } from '@/data/chinese/dialogues';

interface SpeakItem {
  text: string;
  lang?: 'target' | 'english'; // 'target' = Chinese/Japanese, 'english' = English TTS
}

function usePlayAll() {
  const { language, speechRate } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const cancelledRef = useRef(false);

  const playAll = useCallback(async (items: SpeakItem[], pauseMs: number = 400) => {
    cancelledRef.current = false;
    setPlaying(true);
    let itemIndex = 0;
    for (let i = 0; i < items.length; i++) {
      if (cancelledRef.current) break;
      const item = items[i];
      // Track which "logical" item we're on (for highlighting)
      // English translations share the same index as their Chinese word
      if (item.lang !== 'english') {
        itemIndex = i;
        setCurrentIndex(itemIndex);
      }
      try {
        if (item.lang === 'english') {
          await speakEnglish(item.text, speechRate);
        } else {
          await speak(item.text, language, speechRate);
        }
      } catch {
        // skip errors
      }
      // Pause between items
      if (!cancelledRef.current) {
        await new Promise(r => setTimeout(r, pauseMs));
      }
    }
    setPlaying(false);
    setCurrentIndex(-1);
  }, [language, speechRate]);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    stopSpeaking();
    setPlaying(false);
    setCurrentIndex(-1);
  }, []);

  return { playing, currentIndex, playAll, stop };
}

const StopIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);

function PlayAllButton({ items, label, pauseMs }: { items: SpeakItem[]; label?: string; pauseMs?: number }) {
  const { playing, playAll, stop } = usePlayAll();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => playing ? stop() : playAll(items, pauseMs)}
      className="text-xs gap-1.5"
    >
      {playing ? <><StopIcon /> Stop</> : <><PlayIcon /> {label ?? 'Play All'}</>}
    </Button>
  );
}

interface TopicReviewProps {
  language: Language;
  onBack: () => void;
}

interface LessonReviewData {
  lesson: number;
  title: string;
  titleChinese: string;
  vocabulary: VocabularyItem[];
  dialogues: Dialogue[];
}

function buildReviewData(): LessonReviewData[] {
  return lessonsData.lessons.map(lesson => {
    const vocab = chineseVocabulary.filter(v => v.level === lesson.title);
    const dialogues = chineseDialogues.filter(d => d.lesson === lesson.lesson);
    return {
      lesson: lesson.lesson,
      title: lesson.title,
      titleChinese: lesson.titleChinese,
      vocabulary: vocab,
      dialogues,
    };
  });
}

// Also include base HSK vocabulary not tied to a lesson
function getHSKReviewData(): LessonReviewData[] {
  const hskLevels = ['HSK 1', 'HSK 2', 'HSK 3'];
  return hskLevels.map(level => {
    const vocab = chineseVocabulary.filter(v => v.level === level);
    if (vocab.length === 0) return null;
    return {
      lesson: 0,
      title: level,
      titleChinese: level === 'HSK 1' ? 'HSK一级' : level === 'HSK 2' ? 'HSK二级' : 'HSK三级',
      vocabulary: vocab,
      dialogues: [],
    };
  }).filter(Boolean) as LessonReviewData[];
}

export function TopicReview({ language, onBack }: TopicReviewProps) {
  const [selectedTopic, setSelectedTopic] = useState<LessonReviewData | null>(null);

  if (language !== 'chinese') {
    return (
      <div className="p-5 md:p-8 max-w-xl mx-auto space-y-5">
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
        <p className="text-sm text-muted-foreground">Topic review is currently available for Chinese only.</p>
      </div>
    );
  }

  const lessonData = buildReviewData();
  const hskData = getHSKReviewData();

  if (selectedTopic) {
    return (
      <TopicContent
        data={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Study & Review</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Review vocabulary, sentences & dialogues by topic</p>
        </div>
      </div>

      {/* Lesson topics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Lessons</h2>
        <div className="space-y-2">
          {lessonData.map(data => (
            <button
              key={data.lesson}
              onClick={() => setSelectedTopic(data)}
              className="w-full text-left"
            >
              <Card className="p-3.5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {data.title}
                      <span className="text-muted-foreground font-normal ml-1.5">{data.titleChinese}</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {data.vocabulary.length} words
                      {data.dialogues.length > 0 && ` · ${data.dialogues.length} dialogue${data.dialogues.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    L{data.lesson}
                  </Badge>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* HSK base vocabulary */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">HSK Base Vocabulary</h2>
        <div className="space-y-2">
          {hskData.map(data => (
            <button
              key={data.title}
              onClick={() => setSelectedTopic(data)}
              className="w-full text-left"
            >
              <Card className="p-3.5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{data.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{data.vocabulary.length} words</p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopicContent({ data, onBack }: { data: LessonReviewData; onBack: () => void }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [expandedDialogue, setExpandedDialogue] = useState<string | null>(null);

  return (
    <div className="p-5 md:p-8 max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>&larr; Back</Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{data.title}</h1>
          <p className="text-muted-foreground text-xs">{data.titleChinese}</p>
        </div>
      </div>

      {/* Toggle controls */}
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

      {/* Vocabulary */}
      {data.vocabulary.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              Vocabulary
              <Badge variant="outline" className="text-[10px]">{data.vocabulary.length}</Badge>
            </h2>
            <PlayAllButton
              items={data.vocabulary.flatMap(v => [
                { text: v.word, lang: 'target' as const },
                ...(showTranslation ? [{ text: v.meaning, lang: 'english' as const }] : []),
              ])}
              pauseMs={1200}
            />
          </div>
          <div className="space-y-1">
            {data.vocabulary.map(item => (
              <VocabRow
                key={item.id}
                item={item}
                showPinyin={showPinyin}
                showTranslation={showTranslation}
              />
            ))}
          </div>
        </section>
      )}

      {/* Example Sentences */}
      {data.vocabulary.some(v => v.exampleSentence) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Example Sentences</h2>
            <PlayAllButton
              items={data.vocabulary.filter(v => v.exampleSentence).flatMap(v => [
                { text: v.exampleSentence!, lang: 'target' as const },
                ...(showTranslation ? [{ text: v.exampleTranslation ?? v.meaning, lang: 'english' as const }] : []),
              ])}
              pauseMs={1000}
            />
          </div>
          <div className="space-y-2">
            {data.vocabulary
              .filter(v => v.exampleSentence)
              .map(item => (
                <SentenceRow
                  key={item.id + '_sent'}
                  item={item}
                  showPinyin={showPinyin}
                  showTranslation={showTranslation}
                />
              ))}
          </div>
        </section>
      )}

      {/* Dialogues */}
      {data.dialogues.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              Dialogues
              <Badge variant="outline" className="text-[10px]">{data.dialogues.length}</Badge>
            </h2>
            <PlayAllButton
              items={data.dialogues.flatMap(d =>
                d.lines.flatMap(l => [
                  { text: l.text, lang: 'target' as const },
                  ...(showTranslation ? [{ text: l.translation, lang: 'english' as const }] : []),
                ])
              )}
              pauseMs={800}
              label="Play All Dialogues"
            />
          </div>
          <div className="space-y-3">
            {data.dialogues.map(dialogue => (
              <DialogueSection
                key={dialogue.id}
                dialogue={dialogue}
                expanded={expandedDialogue === dialogue.id}
                onToggle={() =>
                  setExpandedDialogue(prev =>
                    prev === dialogue.id ? null : dialogue.id
                  )
                }
                showPinyin={showPinyin}
                showTranslation={showTranslation}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function VocabRow({
  item,
  showPinyin,
  showTranslation,
}: {
  item: VocabularyItem;
  showPinyin: boolean;
  showTranslation: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <SpeakButton text={item.word} size="icon" className="opacity-0 group-hover:opacity-100 shrink-0" />
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="text-base font-medium">{item.word}</span>
        {showPinyin && (
          <span className="text-xs text-muted-foreground">{item.reading}</span>
        )}
        {item.partOfSpeech && (
          <span className="text-[10px] text-muted-foreground/60 italic">{item.partOfSpeech}</span>
        )}
      </div>
      {showTranslation && (
        <span className="text-xs text-muted-foreground shrink-0">{item.meaning}</span>
      )}
    </div>
  );
}

function SentenceRow({
  item,
  showPinyin,
  showTranslation,
}: {
  item: VocabularyItem;
  showPinyin: boolean;
  showTranslation: boolean;
}) {
  return (
    <div className="py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex items-start gap-2">
        <SpeakButton text={item.exampleSentence!} size="icon" className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-medium">{item.exampleSentence}</p>
          {showPinyin && (
            <p className="text-xs text-muted-foreground">
              {item.word} ({item.reading})
            </p>
          )}
          {showTranslation && (
            <p className="text-xs text-muted-foreground/70 italic">{item.exampleTranslation}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DialogueSection({
  dialogue,
  expanded,
  onToggle,
  showPinyin,
  showTranslation,
}: {
  dialogue: Dialogue;
  expanded: boolean;
  onToggle: () => void;
  showPinyin: boolean;
  showTranslation: boolean;
}) {
  const speakerColors = [
    'text-blue-600 dark:text-blue-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-purple-600 dark:text-purple-400',
    'text-amber-600 dark:text-amber-400',
  ];
  const speakers = [...new Set(dialogue.lines.map(l => l.speaker))];

  return (
    <Card>
      <button onClick={onToggle} className="w-full text-left p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">
              {dialogue.title}
              <span className="text-muted-foreground font-normal ml-1.5">{dialogue.titleChinese}</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{dialogue.setting}</p>
          </div>
          <svg
            className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', expanded && 'rotate-180')}
            fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>
      {expanded && (
        <CardContent className="px-3.5 pb-3.5 pt-0 space-y-2">
          {dialogue.lines.map((line, i) => {
            const speakerIndex = speakers.indexOf(line.speaker);
            const colorClass = speakerColors[speakerIndex % speakerColors.length];

            return (
              <div key={i} className="flex items-start gap-2 group">
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
        </CardContent>
      )}
    </Card>
  );
}
