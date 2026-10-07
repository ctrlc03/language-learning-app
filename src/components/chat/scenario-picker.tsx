'use client';

import type { Language } from '@/types';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { getLessonRolePlays, getScenarios } from '@/lib/chat/scenarios';

/** How many of a role-play's goals the card lists before "+N more". */
const GOALS_PREVIEW = 2;

interface ScenarioPickerProps {
  language: Language;
  /** The chosen scenario or role-play id, or null for a free conversation. */
  onSelect: (scenarioId: string | null) => void;
}

export function ScenarioPicker({ language, onSelect }: ScenarioPickerProps) {
  const [currentLesson] = useCurrentLesson();
  const scenarios = getScenarios(language);
  const rolePlays = language === 'chinese' ? getLessonRolePlays(currentLesson) : [];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Choose a conversation scenario</h2>
        <p className="text-sm text-muted-foreground mt-1">Or start a free conversation</p>
      </div>

      <button
        type="button"
        onClick={() => onSelect(null)}
        className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-center"
      >
        <span className="block font-medium">Free Conversation</span>
        <span className="block text-sm text-muted-foreground">Chat about anything</span>
      </button>

      {rolePlays.length > 0 && (
        <section aria-labelledby="role-play-heading" className="space-y-2">
          <div>
            <h3 id="role-play-heading" className="text-sm font-semibold">
              Lesson role-play
              <span className="cjk text-primary"> · 情景对话</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Play a scene from a lesson. The AI speaks first, in character.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rolePlays.map((rolePlay) => (
              <button
                key={rolePlay.id}
                type="button"
                onClick={() => onSelect(rolePlay.id)}
                className="block h-full w-full border border-border bg-card p-4 text-left text-card-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{rolePlay.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Lesson {rolePlay.lesson}
                  </span>
                </span>
                <span className="cjk block text-sm text-primary mt-0.5">
                  {rolePlay.titleChinese}
                </span>
                <span className="block mt-2 text-xs text-muted-foreground space-y-0.5">
                  {rolePlay.goals.slice(0, GOALS_PREVIEW).map((goal) => (
                    <span key={goal} className="block">
                      · {goal}
                    </span>
                  ))}
                  {rolePlay.goals.length > GOALS_PREVIEW && (
                    <span className="block">+ {rolePlay.goals.length - GOALS_PREVIEW} more</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section
        aria-label="Conversation scenarios"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario.id)}
            className="block h-full w-full border border-border bg-card p-4 text-left text-card-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="block font-medium">{scenario.name}</span>
            <span
              className={`block text-sm text-primary mt-0.5${language === 'chinese' ? ' cjk' : ''}`}
            >
              {scenario.nameNative}
            </span>
            <span className="block text-xs text-muted-foreground mt-1">{scenario.description}</span>
          </button>
        ))}
      </section>
    </div>
  );
}
