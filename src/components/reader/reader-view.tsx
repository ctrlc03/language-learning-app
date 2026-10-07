'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GlossPanel } from '@/components/reader/gloss-panel';
import { ReaderQuestions } from '@/components/reader/reader-questions';
import { SpeakButton, SpeechNotice } from '@/components/shared/speak-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechNotice } from '@/hooks/use-speech';
import { piecesPinyin } from '@/lib/language/pinyin';
import { coverageOf, markTokens } from '@/lib/reader/coverage';
import { glossWord } from '@/lib/reader/gloss';
import { getPassageQuestions, type ReaderText } from '@/lib/reader/library';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import { cn } from '@/lib/utils';

interface ReaderViewProps {
  text: ReaderText;
  currentLesson: number;
  /** For an AI story: the words the course has not reached, as reported by the server. */
  unknownWords?: string[];
  onBack: () => void;
}

interface ToggleProps {
  pressed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Toggle({ pressed, onToggle, children }: ToggleProps) {
  return (
    <Button
      variant={pressed ? 'primary' : 'outline'}
      size="sm"
      aria-pressed={pressed}
      onClick={onToggle}
    >
      <span>{children}</span>
    </Button>
  );
}

export function ReaderView({ text, currentLesson, unknownWords, onBack }: ReaderViewProps) {
  const { speechRate } = useLanguage();
  const { notice, reportSpeechError } = useSpeechNotice();

  // Generated stories are written for the lesson they were requested at.
  const lesson = text.generated ? text.lesson : currentLesson;
  const isDialogue = text.kind === 'dialogue';

  const [showPinyin, setShowPinyin] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showSpeakers, setShowSpeakers] = useState(true);
  const [markNew, setMarkNew] = useState(!!text.generated);
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(new Set());
  const [open, setOpen] = useState<{ line: number; token: number } | null>(null);
  const [playingLine, setPlayingLine] = useState<number | null>(null);

  const tokenButtons = useRef(new Map<string, HTMLButtonElement>());
  const playRun = useRef(0);

  const lineTokens = useMemo(
    () => text.lines.map((l) => markTokens(l.text, lesson)),
    [text, lesson],
  );
  const lineReadings = useMemo(
    () => lineTokens.map((tokens) => piecesPinyin(tokens.map((t) => t.text))),
    [lineTokens],
  );
  const coverage = useMemo(
    () =>
      coverageOf(
        text.lines.map((l) => l.text),
        lesson,
      ),
    [text, lesson],
  );
  const questions = useMemo(() => getPassageQuestions(text), [text]);

  const closeGloss = useCallback(() => {
    if (open) tokenButtons.current.get(`${open.line}:${open.token}`)?.focus();
    setOpen(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGloss();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeGloss]);

  // Leaving the view silences a "Play all" in progress.
  useEffect(() => {
    const run = playRun;
    return () => {
      run.current++;
      stopSpeaking();
    };
  }, []);

  const playing = playingLine !== null;

  const playAll = async () => {
    const run = ++playRun.current;
    try {
      for (let i = 0; i < text.lines.length; i++) {
        if (playRun.current !== run) return;
        setPlayingLine(i);
        await speak(text.lines[i].text, 'chinese', speechRate);
      }
    } catch (err) {
      reportSpeechError(err);
    } finally {
      if (playRun.current === run) setPlayingLine(null);
    }
  };

  const stopAll = () => {
    playRun.current++;
    stopSpeaking();
    setPlayingLine(null);
  };

  // A speaker pressed during Play all takes over: its own speak() cancels the current utterance,
  // so the loop must be told to stop instead of carrying on to the next line.
  const haltPlayAll = () => {
    playRun.current++;
    setPlayingLine(null);
  };

  const toggleReveal = (index: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (!next.delete(index)) next.add(index);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <span>← Library</span>
        </Button>
        <div>
          <h2 className="text-xl font-semibold">
            {text.title}
            <span className="cjk text-muted-foreground" lang="zh-CN">
              {' '}
              · {text.titleChinese}
            </span>
          </h2>
          {text.setting && <p className="mt-1 text-sm text-muted-foreground">{text.setting}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={text.kind === 'passage' ? 'default' : 'outline'}>
              {text.generated ? 'AI STORY' : text.kind === 'passage' ? 'PASSAGE' : 'DIALOGUE'}
            </Badge>
            {!text.generated && <Badge variant="outline">LESSON {text.lesson}</Badge>}
            <Badge variant={coverage.percent >= 95 ? 'success' : 'warning'}>
              {coverage.percent}% known
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Reading options">
        <Toggle pressed={showPinyin} onToggle={() => setShowPinyin((v) => !v)}>
          Pinyin
        </Toggle>
        <Toggle pressed={showEnglish} onToggle={() => setShowEnglish((v) => !v)}>
          English
        </Toggle>
        {isDialogue && (
          <Toggle pressed={showSpeakers} onToggle={() => setShowSpeakers((v) => !v)}>
            Speakers
          </Toggle>
        )}
        <Toggle pressed={markNew} onToggle={() => setMarkNew((v) => !v)}>
          Mark new words
        </Toggle>
        <Button
          variant={playing ? 'destructive' : 'outline'}
          size="sm"
          onClick={playing ? stopAll : playAll}
        >
          <span>{playing ? 'Stop' : 'Play all'}</span>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">Tap a word to see what it means.</p>

      <Card>
        <CardContent className="p-0">
          <ol className="divide-y divide-border">
            {text.lines.map((line, lineIndex) => {
              const tokens = lineTokens[lineIndex];
              const openToken = open?.line === lineIndex ? open.token : null;
              const glossId = `gloss-${lineIndex}`;
              const englishShown = showEnglish || revealed.has(lineIndex);
              return (
                <li
                  key={lineIndex}
                  className={cn(
                    'flex items-start gap-2 p-4',
                    playingLine === lineIndex && 'bg-primary/5',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    {isDialogue && showSpeakers && (
                      <div className="mb-0.5 text-xs font-medium text-muted-foreground">
                        {line.speaker}
                      </div>
                    )}
                    <p className="cjk text-xl leading-loose" lang="zh-CN">
                      {tokens.map((token, tokenIndex) => {
                        if (!token.han) return <span key={tokenIndex}>{token.text}</span>;
                        const isOpen = openToken === tokenIndex;
                        return (
                          <button
                            key={tokenIndex}
                            type="button"
                            ref={(el) => {
                              const key = `${lineIndex}:${tokenIndex}`;
                              if (el) tokenButtons.current.set(key, el);
                              else tokenButtons.current.delete(key);
                            }}
                            aria-expanded={isOpen}
                            aria-controls={isOpen ? glossId : undefined}
                            onClick={() =>
                              setOpen(isOpen ? null : { line: lineIndex, token: tokenIndex })
                            }
                            className={cn(
                              'cjk rounded-sm px-px hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                              isOpen && 'bg-primary/15',
                              markNew &&
                                token.unknown &&
                                'bg-accent/15 underline decoration-dotted underline-offset-4',
                            )}
                          >
                            <span>{token.text}</span>
                          </button>
                        );
                      })}
                    </p>
                    {showPinyin && <p className="text-sm text-primary">{line.pinyin}</p>}
                    {englishShown && <p className="mt-1 text-sm">{line.translation}</p>}
                    {openToken !== null && (
                      <GlossPanel
                        id={glossId}
                        gloss={glossWord(
                          tokens[openToken].text,
                          lesson,
                          lineReadings[lineIndex][openToken],
                        )}
                        onClose={closeGloss}
                        onSpeak={haltPlayAll}
                      />
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <span onClickCapture={haltPlayAll}>
                      <SpeakButton text={line.text} language="chinese" />
                    </span>
                    {!showEnglish && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-pressed={revealed.has(lineIndex)}
                        aria-label={`${revealed.has(lineIndex) ? 'Hide' : 'Show'} English for line ${lineIndex + 1}`}
                        onClick={() => toggleReveal(lineIndex)}
                      >
                        <span>EN</span>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {unknownWords && unknownWords.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Words beyond your course:{' '}
          {unknownWords.map((w, i) => (
            <span key={w}>
              {i > 0 && '、'}
              <span className="cjk" lang="zh-CN">
                {w}
              </span>
            </span>
          ))}
        </p>
      )}

      <ReaderQuestions key={text.id} items={questions} />
      <SpeechNotice message={notice} />
    </div>
  );
}
