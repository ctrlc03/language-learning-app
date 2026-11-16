'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ExplanationCard } from '@/components/compose/explanation-card';
import { WordBreakdown } from '@/components/compose/word-breakdown';
import { PinyinKeyboardPanel } from '@/components/shared/pinyin-keyboard';
import { SpeakButton } from '@/components/shared/speak-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { useExplain } from '@/hooks/use-explain';
import { usePinyinKeyboard, useTextareaTarget } from '@/hooks/use-pinyin-keyboard';
import { useSpeechInit } from '@/hooks/use-speech';
import { MAX_COMPOSE_LENGTH } from '@/lib/compose/explain';
import { describeWords } from '@/lib/compose/words';
import { hasHan } from '@/lib/language/pinyin';

/** Buttons that leave the caret in the text box, as the keyboard's keys do. */
function keepFocus(e: React.MouseEvent) {
  e.preventDefault();
}

export default function ComposePage() {
  const { language } = useLanguage();
  const [lesson] = useCurrentLesson();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const explainer = useExplain(lesson);
  const chinese = language === 'chinese';

  useSpeechInit();

  const explain = () => {
    if (hasHan(text) && !explainer.loading) explainer.explain(text.trim());
  };
  const target = useTextareaTarget(textareaRef, text, setText, {
    maxLength: MAX_COMPOSE_LENGTH,
    submit: explain,
  });
  const keyboard = usePinyinKeyboard(chinese, target);
  const composing = keyboard.typed !== '';
  const canExplain = hasHan(text) && !composing && !explainer.loading;
  const words = useMemo(
    () => describeWords(text, keyboard.dictionary),
    [text, keyboard.dictionary],
  );
  const showExplanation =
    explainer.loading || explainer.error !== null || explainer.result !== null;

  // Grow the box with its text.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 240) + 'px';
  }, [text]);

  // The box keeps focus so a physical keyboard types pinyin too; inputMode="none"
  // keeps a phone's own keyboard from covering the on-screen one.
  useEffect(() => {
    if (chinese) textareaRef.current?.focus({ preventScroll: true });
  }, [chinese]);

  // The explanation sits below the keyboard: bring it into view when it starts and lands.
  useEffect(() => {
    if (showExplanation) {
      explanationRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [showExplanation, explainer.result]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter confirms a system IME's candidate while it composes; it must not explain.
    if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
    if (keyboard.handleKey(e)) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      explain();
    }
  };

  const clear = () => {
    keyboard.press({ kind: 'clear' });
    setText('');
    explainer.reset();
  };

  if (!chinese) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Compose</h1>
        <p className="text-muted-foreground">
          Compose is for writing Chinese with pinyin. Switch the language to Chinese to use it.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="page-top">
        <div>
          <div className="greet">拼音输入 · write with pinyin</div>
          <h1>
            Compose<span className="cjk"> · 写作</span>
          </h1>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Type pinyin and tap the characters you mean. Each word&rsquo;s pinyin and meaning show
        below; Explain asks the AI what the whole text says and whether it&rsquo;s right.
      </p>

      <Card>
        <CardContent className="space-y-2 p-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            maxLength={MAX_COMPOSE_LENGTH}
            inputMode="none"
            lang="zh-CN"
            aria-label="Your Chinese"
            placeholder="Type pinyin on the keyboard below, e.g. nihao"
            className="cjk block w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xl leading-relaxed placeholder:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex items-center gap-2">
            {hasHan(text) && <SpeakButton text={text} language="chinese" />}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={keepFocus}
              onClick={clear}
              disabled={!text && !composing}
            >
              <span>Clear</span>
            </Button>
            <Button
              size="sm"
              className="ml-auto"
              onMouseDown={keepFocus}
              onClick={explain}
              disabled={!canExplain}
            >
              <span>{explainer.loading ? 'Explaining…' : 'Explain'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PinyinKeyboardPanel keyboard={keyboard} actionLabel="Explain" canAct={canExplain} />

      {showExplanation && (
        <div ref={explanationRef} className="scroll-mb-24">
          <ExplanationCard
            result={explainer.result}
            loading={explainer.loading}
            error={explainer.error}
          />
        </div>
      )}

      {words.some((w) => w.han) && (
        <section aria-labelledby="compose-words" className="space-y-2">
          <h2 id="compose-words" className="text-sm font-medium">
            Word by word
          </h2>
          <WordBreakdown words={words} />
        </section>
      )}
    </div>
  );
}
