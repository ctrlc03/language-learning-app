'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Dialogue } from '@/data/chinese/dialogues';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechNotice } from '@/hooks/use-speech';
import { useSpeechCapture } from '@/hooks/use-speech-capture';
import { gradeAnswer } from '@/lib/language/answer';
import type { AnswerGrade } from '@/lib/language/answer';
import { hasHan } from '@/lib/language/pinyin';
import { speak, stopSpeaking } from '@/lib/tts/speech';
import type { LessonRolePlay } from '@/lib/chat/scenarios';
import { gradeSpoken, likelyLearnerRole, scriptRoles, speakerKey } from '@/lib/chat/script';
import type { DialogueLine, ScriptRole } from '@/lib/chat/script';
import { AnswerFeedback, verdictLabel } from '@/components/shared/answer-feedback';
import { SpeakButton, SpeechNotice } from '@/components/shared/speak-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** How a learner line ended: graded, self-rated, or left without an answer. */
type LineOutcome = AnswerGrade['verdict'] | 'self-right' | 'self-wrong' | 'shown' | 'skipped';

const isRight = (outcome: LineOutcome | undefined) =>
  outcome === 'correct' || outcome === 'self-right';

const PANEL_STYLE: Record<AnswerGrade['verdict'], string> = {
  correct: 'border-success/40 bg-success/10',
  tones: 'border-accent/40 bg-accent/10',
  wrong: 'border-destructive/40 bg-destructive/10',
};

function RoleName({ label }: { label: string }) {
  return <span className={cn(hasHan(label) && 'cjk')}>{label}</span>;
}

/** A line the app speaks: characters, pinyin and English, with a replay button. */
function PartnerLine({ line, role }: { line: DialogueLine; role: ScriptRole | undefined }) {
  const label = role?.label ?? line.speaker;
  return (
    <div className="flex gap-2">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
        <span aria-hidden="true" className={cn(hasHan(role?.initial ?? '') && 'cjk')}>
          {role?.initial ?? Array.from(label)[0]}
        </span>
      </div>
      <div className="max-w-[85%] space-y-0.5 rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          <RoleName label={label} />
        </p>
        <p className="cjk text-base">{line.text}</p>
        <p className="text-xs text-muted-foreground">{line.pinyin}</p>
        <p className="text-sm">{line.translation}</p>
        <SpeakButton text={line.text} language="chinese" size="sm" />
      </div>
    </div>
  );
}

/** A learner line already played through. */
function DoneLine({ line, outcome }: { line: DialogueLine; outcome: LineOutcome | undefined }) {
  return (
    <div className="flex justify-end gap-2">
      <div className="max-w-[85%] space-y-0.5 rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
        <p className="cjk text-base">{line.text}</p>
        <p className="text-xs opacity-80">{line.pinyin}</p>
        <p className="text-sm">{line.translation}</p>
      </div>
      <div
        className={cn(
          'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
          isRight(outcome) ? 'bg-success/10 text-success' : 'bg-foreground/10 text-foreground',
        )}
      >
        <span className="sr-only">{isRight(outcome) ? 'Right' : 'Needs practice'}</span>
        <span aria-hidden="true">{isRight(outcome) ? '✓' : '·'}</span>
      </div>
    </div>
  );
}

interface LearnerTurnProps {
  line: DialogueLine;
  isLast: boolean;
  /** Called just before a recording starts: the app's own voice must not be in it. */
  onBeforeSay: () => void;
  onContinue: (outcome: LineOutcome) => void;
}

/** The learner's turn: the English prompt, then type it or say it. Keyed by line so state resets. */
function LearnerTurn({ line, isLast, onBeforeSay, onContinue }: LearnerTurnProps) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<'typed' | 'spoken' | null>(null);
  const [typedGrade, setTypedGrade] = useState<AnswerGrade | null>(null);
  const [nothingToCheck, setNothingToCheck] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selfRated, setSelfRated] = useState<'right' | 'wrong' | null>(null);
  const capture = useSpeechCapture();

  const heard = mode === 'spoken' && capture.state === 'done' ? capture.result : null;
  const spokenGrade = heard ? gradeSpoken(heard, line) : null;
  const grade = mode === 'typed' ? typedGrade : spokenGrade;
  const needsSelfRate = heard !== null && spokenGrade === null;
  const listening = capture.state === 'starting' || capture.state === 'listening';
  const showLine = revealed || needsSelfRate;

  const outcome: LineOutcome = selfRated
    ? selfRated === 'right'
      ? 'self-right'
      : 'self-wrong'
    : grade
      ? grade.verdict
      : revealed
        ? 'shown'
        : 'skipped';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || listening) return;
    capture.reset();
    setSelfRated(null);
    const graded = gradeAnswer(value, { answers: [line.text], pinyin: line.pinyin });
    setMode('typed');
    setTypedGrade(graded);
    setNothingToCheck(graded === null);
  };

  const sayIt = () => {
    setMode('spoken');
    setSelfRated(null);
    setTypedGrade(null);
    setNothingToCheck(false);
    onBeforeSay();
    void capture.start();
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-xs font-medium tracking-[0.1em] text-muted-foreground">YOUR LINE</p>
          <p className="text-base">{line.translation}</p>
          <p className="text-xs text-muted-foreground">
            Say or type it in Chinese. Pinyin is fine; add tones as marks or numbers (ni3 hao3) to
            have them checked.
          </p>
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input
            type="text"
            lang="zh-CN"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Your line in Chinese characters or pinyin"
            placeholder="Type your line…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="cjk min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button type="submit" disabled={!value.trim() || listening}>
            Check
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {capture.supported.any ? (
            listening ? (
              <Button type="button" variant="outline" size="sm" onClick={capture.stop}>
                {capture.state === 'starting' ? 'Starting…' : 'Stop'}
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={sayIt}>
                {mode === 'spoken' && capture.state === 'done' ? 'Say it again' : 'Say it'}
              </Button>
            )
          ) : (
            <span className="text-xs text-muted-foreground">
              Speaking isn’t available in this browser. Type your line instead.
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={showLine}
            onClick={() => setRevealed((r) => !r)}
            disabled={needsSelfRate}
          >
            {showLine ? 'Hide line' : 'Show line'}
          </Button>
        </div>

        {listening && (
          <p role="status" className="text-sm text-muted-foreground">
            Listening… <span className="cjk text-foreground">{capture.interim}</span>
          </p>
        )}

        {capture.problem && <p className="text-xs text-destructive">{capture.problem}</p>}

        {showLine && (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="cjk text-base">{line.text}</p>
              <p className="text-xs text-muted-foreground">{line.pinyin}</p>
            </div>
            <SpeakButton text={line.text} language="chinese" size="sm" />
          </div>
        )}

        {nothingToCheck && (
          <p className="text-xs text-muted-foreground">
            There are no words in that to check. Type your line and try again.
          </p>
        )}

        {grade && !selfRated && (
          <div
            role="status"
            className={cn('space-y-2 rounded-lg border p-3', PANEL_STYLE[grade.verdict])}
          >
            <p className="font-medium">{verdictLabel(grade)}</p>
            {heard && (
              <p className="text-sm text-muted-foreground">
                I heard: <span className="cjk text-foreground">{heard.transcript}</span>
              </p>
            )}
            <AnswerFeedback grade={grade} />
            {heard && grade.verdict !== 'correct' && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Speech recognition can mishear you. If you said it right, say so.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelfRated('right')}
                >
                  I said it right
                </Button>
              </div>
            )}
          </div>
        )}

        {needsSelfRate && !selfRated && (
          <div role="status" className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-sm">
              {capture.supported.recognition
                ? 'I couldn’t make out any words. Listen to your recording, compare it with the line above, then rate yourself.'
                : 'This browser can’t turn speech into text. Compare your recording with the line above, then rate yourself.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => setSelfRated('right')}>
                I said it right
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelfRated('wrong')}
              >
                Needs more practice
              </Button>
            </div>
          </div>
        )}

        {selfRated && (
          <p role="status" className="text-sm text-muted-foreground">
            Marked as: {selfRated === 'right' ? 'said it right' : 'needs more practice'}.
          </p>
        )}

        {heard?.audioUrl && (
          <audio controls src={heard.audioUrl} aria-label="Your recording" className="h-9 w-full" />
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant={grade || selfRated ? 'primary' : 'ghost'}
            size="sm"
            disabled={listening}
            onClick={() => {
              onContinue(outcome);
            }}
          >
            {grade || selfRated ? (isLast ? 'Finish' : 'Continue') : 'Skip line'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ScriptModeProps {
  rolePlay: LessonRolePlay;
  dialogue: Dialogue;
  onExit: () => void;
}

/**
 * Offline practice of a lesson dialogue: pick a role, the app speaks the other lines,
 * and the learner types or says their own. Needs no network.
 */
export function ScriptMode({ rolePlay, dialogue, onExit }: ScriptModeProps) {
  const roles = useMemo(() => scriptRoles(dialogue), [dialogue]);
  const likelyRole = useMemo(() => likelyLearnerRole(roles, rolePlay), [roles, rolePlay]);
  const { speechRate } = useLanguage();
  const { notice, reportSpeechError } = useSpeechNotice();
  const [roleKey, setRoleKey] = useState<string | null>(null);
  // Index of the learner's pending line; dialogue.lines.length once the dialogue is done.
  const [pos, setPos] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<number, LineOutcome>>({});
  const playToken = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      playToken.current = -1;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [pos, roleKey]);

  /** Speak lines one after another; a newer call (or leaving) cuts this one short. */
  const playLines = useCallback(
    async (lines: DialogueLine[]) => {
      const token = ++playToken.current;
      for (const line of lines) {
        if (token !== playToken.current) return;
        try {
          await speak(line.text, 'chinese', speechRate);
        } catch (err) {
          reportSpeechError(err);
          return;
        }
      }
    },
    [speechRate, reportSpeechError],
  );

  /** Move to the learner's next line at or after `from`, speaking the other roles' lines on the way. */
  const advance = useCallback(
    (from: number, role: string) => {
      const spoken: DialogueLine[] = [];
      let i = from;
      while (i < dialogue.lines.length && speakerKey(dialogue.lines[i].speaker) !== role) {
        spoken.push(dialogue.lines[i]);
        i++;
      }
      setPos(i);
      void playLines(spoken);
    },
    [dialogue, playLines],
  );

  const begin = (role: string) => {
    setRoleKey(role);
    setOutcomes({});
    advance(0, role);
  };

  /** Cut short any partner lines still queued, so they don't play into a recording. */
  const cancelPlayback = useCallback(() => {
    playToken.current++;
    stopSpeaking();
  }, []);

  const chooseRole = () => {
    cancelPlayback();
    setRoleKey(null);
  };

  const learnerTotal = roleKey
    ? dialogue.lines.filter((l) => speakerKey(l.speaker) === roleKey).length
    : 0;
  const rightCount = Object.values(outcomes).filter(isRight).length;
  const finished = roleKey !== null && pos >= dialogue.lines.length;
  const myLabel = roles.find((r) => r.key === roleKey)?.label;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            Script mode · {dialogue.title}
            <span className="cjk text-primary"> · {dialogue.titleChinese}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {myLabel ? (
              <>
                You are <RoleName label={myLabel} />. Works offline.
              </>
            ) : (
              <>Lesson {rolePlay.lesson} dialogue. Works offline.</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {roleKey && (
            <Button type="button" variant="ghost" size="sm" onClick={chooseRole}>
              Change role
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onExit}>
            Back to chat
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {roleKey === null ? (
          <Card>
            <CardContent className="space-y-3 p-4">
              <div>
                <p className="font-medium">Which role do you want to play?</p>
                <p className="text-sm text-muted-foreground">{dialogue.setting}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The app speaks the other lines. For yours you see only the English, then type or
                  say it in Chinese.
                </p>
              </div>
              <ul className="space-y-2">
                {roles.map((role) => (
                  <li key={role.key}>
                    <button
                      type="button"
                      onClick={() => begin(role.key)}
                      className="block w-full rounded-lg border border-border px-3 py-2 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span className="block text-sm font-medium">
                        Play <RoleName label={role.label} />
                        {role.key === likelyRole && (
                          <span className="font-normal text-primary">
                            {' '}
                            · your role in this scene
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Starts with: “{role.firstLine.translation}”
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <>
            {dialogue.lines
              .slice(0, pos)
              .map((line, i) =>
                speakerKey(line.speaker) === roleKey ? (
                  <DoneLine key={i} line={line} outcome={outcomes[i]} />
                ) : (
                  <PartnerLine
                    key={i}
                    line={line}
                    role={roles.find((r) => r.key === speakerKey(line.speaker))}
                  />
                ),
              )}

            {!finished && (
              <LearnerTurn
                key={pos}
                line={dialogue.lines[pos]}
                onBeforeSay={cancelPlayback}
                isLast={
                  !dialogue.lines.slice(pos + 1).some((l) => speakerKey(l.speaker) === roleKey)
                }
                onContinue={(outcome) => {
                  setOutcomes((prev) => ({ ...prev, [pos]: outcome }));
                  advance(pos + 1, roleKey);
                }}
              />
            )}

            {finished && (
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="font-medium">Dialogue complete</p>
                    <p className="text-sm text-muted-foreground">
                      {rightCount} of {learnerTotal} of your lines were right.
                    </p>
                  </div>
                  {dialogue.lines.some(
                    (l, i) => speakerKey(l.speaker) === roleKey && !isRight(outcomes[i]),
                  ) && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium tracking-[0.1em] text-muted-foreground">
                        WORTH ANOTHER GO
                      </p>
                      <ul className="space-y-2">
                        {dialogue.lines.map((l, i) =>
                          speakerKey(l.speaker) === roleKey && !isRight(outcomes[i]) ? (
                            <li key={i} className="flex items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="cjk text-base">{l.text}</p>
                                <p className="text-xs text-muted-foreground">{l.pinyin}</p>
                                <p className="text-sm">{l.translation}</p>
                              </div>
                              <SpeakButton text={l.text} language="chinese" size="sm" />
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => begin(roleKey)}>
                      Practise again
                    </Button>
                    <Button type="button" variant="outline" onClick={chooseRole}>
                      Change role
                    </Button>
                    <Button type="button" variant="ghost" onClick={onExit}>
                      Back to chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      <SpeechNotice message={notice} />
    </div>
  );
}
