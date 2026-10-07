'use client';

import { useEffect, useRef, useState } from 'react';
import type { AnswerGrade } from '@/lib/language/answer';
import type { SelfCheckItem, SelfCheckKind } from '@/lib/selfcheck/parse';
import { answerCore, gradeAnswer } from '@/lib/language/answer';
import { hasHan } from '@/lib/language/pinyin';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import { useLanguage } from '@/contexts/LanguageContext';
import { chineseDialogues } from '@/data/chinese/dialogues';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { AnswerFeedback, verdictLabel } from '@/components/shared/answer-feedback';
import { cn } from '@/lib/utils';

interface SelfCheckCardProps {
  item: SelfCheckItem;
  /** Called exactly once, when the item is graded (automatically or by the learner). */
  onResult: (correct: boolean, answer: string) => void;
  onNext?: () => void;
  /** The reading a passage question is about is already on screen, so the card does not offer to show it. */
  passageShown?: boolean;
}

/** How the card asks for and grades an answer. */
type Mode = 'order' | 'blank-choices' | 'blank-typed' | 'insert' | 'options' | 'typed' | 'reveal';

interface Outcome {
  correct: boolean;
  /** What the learner answered, as text. */
  answer: string;
  /** The grade of a typed answer. */
  grade: AnswerGrade | null;
  /** The learner judged their own answer (reveal flow, or "mine also works"). */
  selfJudged: boolean;
}

interface FinishOptions {
  grade?: AnswerGrade;
  selfJudged?: boolean;
}

type Finish = (correct: boolean, answer: string, options?: FinishOptions) => void;

interface BodyProps {
  item: SelfCheckItem;
  /** The item is graded: show the outcome, accept no more input. */
  disabled: boolean;
  finish: Finish;
}

const KIND_LABELS: Record<SelfCheckKind, string> = {
  order: 'Put in order',
  blank: 'Fill in the blank',
  insert: 'Add the word',
  'choose-reply': 'Choose the reply',
  passage: 'Reading question',
  choice: 'Choose',
  correct: 'Correct the sentence',
  opposite: 'Opposite',
  translate: 'Say it in Chinese',
  reply: 'Reply',
  open: 'Your answer',
  explain: 'Explain',
};

const TYPED_INSTRUCTIONS: Partial<Record<SelfCheckKind, string>> = {
  correct: 'Type the corrected sentence.',
  opposite: 'Type the opposite word.',
  translate: 'Type it in Chinese.',
  reply: 'Type your reply.',
};

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60';

/** Text between blanks of a sentence: n blanks give n + 1 parts. */
function splitBlanks(sentence: string): string[] {
  return sentence.split(/_{2,}|＿+/);
}

/** Sentence text between blanks; a dialogue's next speaker ("B：") starts a new line. */
function PartText({ text }: { text: string }) {
  const lines = text.split(/\s+(?=[A-ZＡ-Ｚ][：:])/);
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

/** Which kind of interaction an item supports, falling back to reveal-and-self-grade when its data is incomplete. */
function modeFor(item: SelfCheckItem): Mode {
  switch (item.kind) {
    case 'order':
      return item.tiles && item.tiles.length > 0 && item.answer ? 'order' : 'reveal';
    case 'blank': {
      if (!item.sentence) return 'reveal';
      const blanks = splitBlanks(item.sentence).length - 1;
      if (blanks < 1) return 'reveal';
      if (item.choices && item.choices.length > 0) {
        const ok =
          item.correct?.length === blanks &&
          item.correct.every((c) => c >= 0 && c < item.choices!.length);
        return ok ? 'blank-choices' : 'reveal';
      }
      return item.fills?.length === blanks ? 'blank-typed' : 'reveal';
    }
    case 'insert': {
      const length = item.sentence ? [...item.sentence].length : -1;
      const ok =
        item.insertWord !== undefined &&
        item.insertAt !== undefined &&
        item.insertAt >= 0 &&
        item.insertAt <= length;
      return ok ? 'insert' : 'reveal';
    }
    case 'choice':
    case 'passage':
    case 'choose-reply': {
      const right = item.correct?.[0];
      const ok =
        item.choices !== undefined &&
        right !== undefined &&
        right >= 0 &&
        right < item.choices.length;
      return ok ? 'options' : 'reveal';
    }
    case 'translate':
    case 'correct':
    case 'opposite':
      return item.answer ? 'typed' : 'reveal';
    case 'reply':
      return !item.openEnded && item.answer ? 'typed' : 'reveal';
    case 'open':
    case 'explain':
      return 'reveal';
  }
}

export function SelfCheckCard({
  item,
  onResult,
  onNext,
  passageShown = false,
}: SelfCheckCardProps) {
  const { speechRate } = useLanguage();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const reported = useRef(false);
  const mode = modeFor(item);

  // Cut off pronunciation when the card goes away (Next, or leaving the page)
  useEffect(() => () => stopSpeaking(), []);

  const finish: Finish = (correct, answer, options) => {
    if (reported.current) return;
    reported.current = true;
    setOutcome({
      correct,
      answer,
      grade: options?.grade ?? null,
      selfJudged: options?.selfJudged ?? false,
    });
    onResult(correct, answer);

    // Pronounce the model answer so the learner ties sound to the characters
    const spoken = options?.grade?.answer ?? item.answer;
    if (spoken && hasHan(spoken)) {
      speak(spoken, 'chinese', speechRate).catch(() => {
        /* TTS unavailable */
      });
    }
  };

  const disabled = outcome !== null;
  const bodyProps: BodyProps = { item, disabled, finish };

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[11px]">
            {KIND_LABELS[item.kind]}
          </Badge>
          <span className="text-[11px] text-muted-foreground">Lesson {item.lesson}</span>
        </div>

        <Prompt item={item} passageShown={passageShown} />

        <div>
          {mode === 'order' && <OrderBody {...bodyProps} />}
          {mode === 'blank-choices' && <BlankChoicesBody {...bodyProps} />}
          {mode === 'blank-typed' && <BlankTypedBody {...bodyProps} />}
          {mode === 'insert' && <InsertBody {...bodyProps} />}
          {mode === 'options' && <OptionsBody {...bodyProps} />}
          {mode === 'typed' && <TypedBody {...bodyProps} />}
          {mode === 'reveal' && <RevealBody {...bodyProps} />}
        </div>

        {outcome && <ResultPanel item={item} outcome={outcome} />}

        {outcome && onNext && (
          <Button onClick={onNext} className="w-full" size="lg" autoFocus>
            Next
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Prompt

function Prompt({ item, passageShown }: { item: SelfCheckItem; passageShown: boolean }) {
  const hasCue =
    !!item.cue && (item.kind === 'reply' || item.kind === 'choose-reply' || item.kind === 'open');
  const promptIsCue = hasCue && item.cue === item.prompt;
  const prompt = item.kind === 'order' ? (item.translation ?? item.prompt) : item.prompt;
  const instruction = instructionFor(item);

  return (
    <div className="space-y-2">
      {hasCue && <Cue cue={item.cue!} translation={item.cueTranslation} />}
      {!promptIsCue && (
        <p className={cn('font-semibold leading-snug', hasCue ? 'text-sm' : 'text-lg')}>{prompt}</p>
      )}
      {item.kind === 'passage' &&
        item.passageTitle &&
        (passageShown ? (
          <p className="text-xs text-muted-foreground">From the reading: {item.passageTitle}</p>
        ) : (
          <PassageText title={item.passageTitle} />
        ))}
      {item.kind === 'choice' && item.sentence && (
        <p className="cjk text-xl font-medium leading-relaxed">{item.sentence}</p>
      )}
      {item.hint && (
        <p className="text-xs text-muted-foreground">
          {item.kind === 'blank' ? item.hint : `Hint: ${item.hint}`}
        </p>
      )}
      {instruction && <p className="text-xs text-muted-foreground">{instruction}</p>}
    </div>
  );
}

function instructionFor(item: SelfCheckItem): string | null {
  switch (modeFor(item)) {
    case 'order':
      return 'Tap the words in order to build the sentence.';
    case 'blank-choices':
      return 'Tap a word to fill each blank.';
    case 'blank-typed':
      return 'Type the missing word for each blank.';
    case 'insert':
      return 'Tap the gap where it goes.';
    case 'typed':
      return TYPED_INSTRUCTIONS[item.kind] ?? null;
    default:
      return null;
  }
}

/** The reading a passage question is about, behind a toggle, for when the question is asked away from it. */
function PassageText({ title }: { title: string }) {
  const [shown, setShown] = useState(false);
  const lines = chineseDialogues.find((d) => d.title === title)?.lines;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        From the reading: {title}
        {lines && !shown && (
          <>
            {' · '}
            <button type="button" onClick={() => setShown(true)} className="underline">
              <span>Show the text</span>
            </button>
          </>
        )}
      </p>
      {lines && shown && (
        <div className="cjk space-y-1 rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed">
          {lines.map((line, i) => (
            <p key={i}>{line.text}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/** A Chinese line to answer, with audio and its English behind a toggle. */
function Cue({ cue, translation }: { cue: string; translation?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="cjk text-lg font-semibold leading-snug">{cue}</p>
        <SpeakButton text={cue} language="chinese" size="sm" />
      </div>
      {translation &&
        (shown ? (
          <p className="text-xs text-muted-foreground">{translation}</p>
        ) : (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="text-[11px] underline text-muted-foreground"
          >
            <span>Show English</span>
          </button>
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result

function ResultPanel({ item, outcome }: { item: SelfCheckItem; outcome: Outcome }) {
  const { correct, grade, selfJudged } = outcome;
  const answer = grade?.answer ?? item.answer;
  const showAnswer = !!answer && hasHan(answer);

  let headline: string;
  if (selfJudged) headline = correct ? 'Counted as correct' : 'Counted as a miss';
  else if (grade) headline = verdictLabel(grade);
  else headline = correct ? 'Correct!' : 'Not quite right';

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg text-sm space-y-2',
        correct ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
      )}
    >
      <p className="font-semibold text-[13px]">{headline}</p>

      {grade ? (
        <div className="flex items-start justify-between gap-2 text-foreground">
          <AnswerFeedback grade={grade} className="min-w-0" />
          {showAnswer && <SpeakButton text={answer} language="chinese" size="sm" />}
        </div>
      ) : (
        showAnswer && (
          <div className="flex items-start justify-between gap-2 text-foreground">
            <div className="min-w-0 space-y-0.5">
              {item.openEnded && (
                <p className="text-xs text-muted-foreground">Sample answer — yours can differ</p>
              )}
              <p className="cjk text-base font-medium">{answer}</p>
              {item.answerPinyin && (
                <p className="text-sm text-muted-foreground">{item.answerPinyin}</p>
              )}
            </div>
            <SpeakButton text={answer} language="chinese" size="sm" />
          </div>
        )
      )}

      {item.note && <p className="text-xs text-foreground/70 whitespace-pre-line">{item.note}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order: tile bank

function OrderBody({ item, disabled, finish }: BodyProps) {
  const tiles = item.tiles!;
  const [placed, setPlaced] = useState<number[]>([]);

  const check = () => {
    const built = answerCore(placed.map((t) => tiles[t]).join(''));
    const accepted = [item.answer!, ...item.alternates].some((a) => answerCore(a) === built);
    finish(accepted, placed.map((t) => tiles[t]).join(''));
  };

  return (
    <div className="space-y-4">
      <div className="min-h-[52px] px-4 py-3 rounded-xl border-2 border-dashed border-border/60 flex flex-wrap gap-2 items-center">
        {placed.length === 0 && (
          <span className="text-muted-foreground/50 text-xs">Tap words below…</span>
        )}
        {placed.map((t, i) => (
          <button
            key={t}
            type="button"
            disabled={disabled}
            aria-label={`Remove ${tiles[t]}`}
            onClick={() => setPlaced((p) => p.filter((x) => x !== t))}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              disabled
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 active:scale-[0.98]',
            )}
          >
            <span className="cjk">{tiles[t]}</span>
            <span className="sr-only"> (word {i + 1})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tiles.map((tile, t) =>
          placed.includes(t) ? null : (
            <button
              key={t}
              type="button"
              disabled={disabled}
              onClick={() => setPlaced((p) => [...p, t])}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03] transition-all active:scale-[0.98] disabled:opacity-40"
            >
              <span className="cjk">{tile}</span>
            </button>
          ),
        )}
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <Button onClick={check} disabled={placed.length === 0}>
            Check
          </Button>
          <Button variant="ghost" onClick={() => setPlaced([])} disabled={placed.length === 0}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blanks

/** The sentence with the blanks filled in, for the answer log. */
function fillSentence(parts: string[], fills: string[]): string {
  return parts.map((part, i) => (i < fills.length ? part + fills[i] : part)).join('');
}

function BlankChoicesBody({ item, disabled, finish }: BodyProps) {
  const parts = splitBlanks(item.sentence!);
  const choices = item.choices!;
  const correct = item.correct!;
  const [slots, setSlots] = useState<(number | null)[]>(() => parts.slice(1).map(() => null));
  // One word fills one blank unless the key uses a word twice
  const reusable = new Set(correct).size < correct.length;

  const fill = (choice: number) => {
    const next = slots.indexOf(null);
    if (next === -1) return;
    setSlots(slots.map((s, i) => (i === next ? choice : s)));
  };

  const check = () => {
    const ok = slots.every((s, i) => s === correct[i]);
    finish(
      ok,
      fillSentence(
        parts,
        slots.map((s) => (s === null ? '' : choices[s])),
      ),
    );
  };

  return (
    <div className="space-y-4">
      <p className="cjk text-xl leading-[2.4] font-medium">
        {parts.map((part, i) => (
          <span key={i}>
            <PartText text={part} />
            {i < slots.length && (
              <Slot
                index={i}
                label={slots[i] === null ? null : choices[slots[i]!]}
                disabled={disabled}
                state={disabled ? (slots[i] === correct[i] ? 'right' : 'wrong') : 'open'}
                onClear={() => setSlots(slots.map((s, j) => (j === i ? null : s)))}
              />
            )}
          </span>
        ))}
      </p>

      <div className="flex flex-wrap gap-2">
        {choices.map((choice, c) => (
          <button
            key={c}
            type="button"
            disabled={disabled || slots.indexOf(null) === -1 || (!reusable && slots.includes(c))}
            onClick={() => fill(c)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03] transition-all active:scale-[0.98] disabled:opacity-40"
          >
            <span className="cjk">{choice}</span>
          </button>
        ))}
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <Button onClick={check} disabled={slots.includes(null)}>
            Check
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSlots(slots.map(() => null))}
            disabled={slots.every((s) => s === null)}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

function Slot({
  index,
  label,
  disabled,
  state,
  onClear,
}: {
  index: number;
  label: string | null;
  disabled: boolean;
  state: 'open' | 'right' | 'wrong';
  onClear: () => void;
}) {
  const base = 'inline-block min-w-[3.5rem] mx-1 px-2 text-center align-baseline border-b-2';
  if (label === null) {
    return (
      <span
        role="img"
        aria-label={`Blank ${index + 1}, empty`}
        className={cn(base, 'border-primary/50 text-transparent')}
      >
        ＿
      </span>
    );
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClear}
      aria-label={`Blank ${index + 1}: ${label}${disabled ? '' : ', tap to clear'}`}
      className={cn(
        base,
        'rounded-t-md transition-colors',
        state === 'open' && 'border-primary bg-primary/10 text-primary',
        state === 'right' && 'border-success bg-success/10 text-success',
        state === 'wrong' && 'border-destructive bg-destructive/10 text-destructive',
      )}
    >
      <span>{label}</span>
    </button>
  );
}

function BlankTypedBody({ item, disabled, finish }: BodyProps) {
  const parts = splitBlanks(item.sentence!);
  const fills = item.fills!;
  const [inputs, setInputs] = useState<string[]>(() => fills.map(() => ''));
  const [oks, setOks] = useState<boolean[] | null>(null);

  const ready = inputs.every((v) => v.trim() !== '');

  const check = () => {
    if (!ready) return;
    const results = inputs.map(
      (v, i) => gradeAnswer(v, { answers: [fills[i]] })?.verdict === 'correct',
    );
    setOks(results);
    finish(
      results.every(Boolean),
      fillSentence(
        parts,
        inputs.map((v) => v.trim()),
      ),
    );
  };

  return (
    <div className="space-y-4">
      <p className="cjk text-xl leading-[2.6] font-medium">
        {parts.map((part, i) => (
          <span key={i}>
            <PartText text={part} />
            {i < fills.length && (
              <input
                style={{ width: `${Math.max(6, [...fills[i]].length * 1.3 + 2)}rem` }}
                type="text"
                value={inputs[i]}
                disabled={disabled}
                aria-label={`Blank ${i + 1}`}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus={i === 0}
                onChange={(e) => setInputs(inputs.map((v, j) => (j === i ? e.target.value : v)))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) check();
                }}
                className={cn(
                  'mx-1 rounded-lg border bg-background px-2 py-1 text-center text-base focus:outline-none focus:ring-2 focus:ring-primary/40',
                  oks === null && 'border-border',
                  oks?.[i] === true && 'border-success text-success',
                  oks?.[i] === false && 'border-destructive text-destructive',
                )}
              />
            )}
          </span>
        ))}
      </p>
      {!disabled && (
        <Button onClick={check} disabled={!ready}>
          Check
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Insert: tap the gap

function InsertBody({ item, disabled, finish }: BodyProps) {
  const chars = [...item.sentence!];
  const word = item.insertWord!;
  const at = item.insertAt!;
  const [picked, setPicked] = useState<number | null>(null);

  // Right is judged on the sentence a gap builds (punctuation kept), not on the key's index,
  // since the key may sit on either side of a comma.
  const flat = (s: string) => s.normalize('NFKC').replace(/\s+/g, '');
  const accepted = [item.answer, ...item.alternates].filter((a): a is string => !!a).map(flat);
  const build = (g: number) => [...chars.slice(0, g), word, ...chars.slice(g)].join('');
  const matches = (g: number) => accepted.includes(flat(build(g)));
  const rightGap = Array.from({ length: chars.length + 1 }, (_, g) => g).find(matches) ?? at;

  const gapLabel = (g: number) =>
    g === 0 ? 'Insert here, at the start' : `Insert here, after ${chars[g - 1]}`;

  const check = () => {
    if (picked === null) return;
    finish(matches(picked), build(picked));
  };

  const gap = (g: number) => {
    const shown = disabled ? rightGap === g || picked === g : picked === g;
    const state = !disabled ? 'open' : rightGap === g ? 'right' : picked === g ? 'wrong' : 'open';
    if (shown) {
      return (
        <button
          key={`g${g}`}
          type="button"
          disabled={disabled}
          aria-label={gapLabel(g)}
          aria-pressed={true}
          onClick={() => setPicked(g)}
          className={cn(
            'mx-0.5 px-1.5 rounded-md',
            state === 'open' && 'bg-primary/10 text-primary',
            state === 'right' && 'bg-success/10 text-success',
            state === 'wrong' && 'bg-destructive/10 text-destructive line-through',
          )}
        >
          <span>{word}</span>
        </button>
      );
    }
    return (
      <button
        key={`g${g}`}
        type="button"
        disabled={disabled}
        aria-label={gapLabel(g)}
        onClick={() => setPicked(g)}
        className="inline-block h-9 w-4 align-middle rounded-md border border-dashed border-border/70 hover:border-primary hover:bg-primary/10 disabled:opacity-30 mx-px"
      >
        <span className="sr-only">{gapLabel(g)}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add <span className="cjk font-semibold text-foreground">{word}</span> to:
      </p>
      <p className="cjk text-2xl leading-[2.4] font-medium">
        {gap(0)}
        {chars.map((ch, i) => (
          <span key={i}>
            {ch}
            {gap(i + 1)}
          </span>
        ))}
      </p>
      {!disabled && (
        <Button onClick={check} disabled={picked === null}>
          Check
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Options: choice / passage / choose-reply

function OptionsBody({ item, disabled, finish }: BodyProps) {
  const choices = item.choices!;
  const right = item.correct![0];
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {choices.map((choice, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => {
            setPicked(i);
            finish(i === right, choice);
          }}
          className={cn(
            'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
            !disabled &&
              'border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.99]',
            disabled && i === right && 'border-success bg-success/10 text-success',
            disabled &&
              i !== right &&
              i === picked &&
              'border-destructive bg-destructive/10 text-destructive',
            disabled && i !== right && i !== picked && 'border-border opacity-50',
          )}
        >
          <span className="flex items-baseline gap-3">
            <span className="text-[11px] text-muted-foreground">{String.fromCharCode(65 + i)}</span>
            <span className={cn(hasHan(choice) && 'cjk text-base')}>{choice}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Typed answers: translate / correct / opposite / closed reply

function TypedBody({ item, disabled, finish }: BodyProps) {
  const [text, setText] = useState('');
  const [blankTried, setBlankTried] = useState(false);
  const [pending, setPending] = useState<AnswerGrade | null>(null);
  // Phrasing can legitimately vary everywhere except an opposite
  const judgeable = item.kind !== 'opposite';
  const locked = disabled || pending !== null;

  const submit = () => {
    if (locked) return;
    const grade = gradeAnswer(text, {
      answers: [item.answer!, ...item.alternates],
      pinyin: item.answerPinyin,
    });
    if (!grade) {
      setBlankTried(true);
      return;
    }
    if (judgeable && grade.verdict === 'wrong' && grade.mode === 'hanzi') {
      setPending(grade);
      return;
    }
    finish(grade.verdict === 'correct', text.trim(), { grade });
  };

  const judge = (correct: boolean) => {
    if (!pending) return;
    finish(correct, text.trim(), { grade: pending, selfJudged: true });
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={text}
        disabled={locked}
        aria-label="Your answer"
        placeholder="Type in characters or pinyin"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        onChange={(e) => {
          setText(e.target.value);
          setBlankTried(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit();
        }}
        className={INPUT_CLASS}
      />

      {blankTried && (
        <p className="text-xs text-muted-foreground">Type some characters or pinyin first.</p>
      )}

      {!locked && (
        <Button onClick={submit} disabled={!text.trim()}>
          Check
        </Button>
      )}

      {pending && !disabled && (
        <div className="rounded-lg border border-border px-4 py-3 space-y-3">
          <p className="text-[13px] font-semibold">Not the same as the model answer</p>
          <AnswerFeedback grade={pending} />
          <p className="text-xs text-muted-foreground">
            Sentences can be worded differently. Is yours also right?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => judge(false)}>
              Mine is wrong
            </Button>
            <Button variant="outline" size="sm" onClick={() => judge(true)}>
              Mine also works
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reveal and self-grade: open / explain / open-ended reply (and incomplete items)

function RevealBody({ item, disabled, finish }: BodyProps) {
  const [text, setText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const answer = item.answer;
  const hasKey = !!answer || !!item.note;

  if (disabled) return null;

  return (
    <div className="space-y-3">
      {item.kind !== 'explain' && (
        <textarea
          value={text}
          disabled={revealed}
          aria-label="Your answer (optional)"
          placeholder="Your answer (optional)"
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[72px] rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-60"
        />
      )}

      {!revealed ? (
        <Button onClick={() => setRevealed(true)}>Show answer</Button>
      ) : (
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-xl px-4 py-3 space-y-1">
            {answer && (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {item.openEnded ? 'Sample answer — yours can differ' : 'Answer'}
                  </p>
                  <p className="cjk text-base font-medium">{answer}</p>
                  {item.answerPinyin && (
                    <p className="text-sm text-muted-foreground">{item.answerPinyin}</p>
                  )}
                </div>
                {hasHan(answer) && <SpeakButton text={answer} language="chinese" size="sm" />}
              </div>
            )}
            {item.note && <p className="text-sm whitespace-pre-line">{item.note}</p>}
            {!hasKey && <p className="text-sm whitespace-pre-line">{item.a}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => finish(true, text.trim(), { selfJudged: true })}
            >
              Got it
            </Button>
            <Button
              variant="outline"
              onClick={() => finish(false, text.trim(), { selfJudged: true })}
            >
              Not yet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
