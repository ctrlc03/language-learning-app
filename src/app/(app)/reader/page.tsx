'use client';

import { useMemo, useState } from 'react';
import { ReaderLibrary } from '@/components/reader/reader-library';
import { ReaderView } from '@/components/reader/reader-view';
import { StoryGenerator } from '@/components/reader/story-generator';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrentLesson } from '@/hooks/use-current-lesson';
import { useSpeechInit } from '@/hooks/use-speech';
import { getReaderGroups, type ReaderText } from '@/lib/reader/library';
import type { StoryResponse } from '@/lib/reader/story';

interface StoryState {
  text: ReaderText;
  unknownWords: string[];
}

export default function ReaderPage() {
  const { language } = useLanguage();
  const [currentLesson] = useCurrentLesson();
  const [openText, setOpenText] = useState<ReaderText | null>(null);
  // A generated story lives only in this component's state.
  const [story, setStory] = useState<StoryState | null>(null);
  useSpeechInit();

  const groups = useMemo(() => getReaderGroups(currentLesson), [currentLesson]);
  const textCount = groups.reduce((n, g) => n + g.entries.length, 0);

  if (language !== 'chinese') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-3">
        <h1>Reader</h1>
        <p className="text-muted-foreground">
          The reader uses the Chinese course texts. Switch the language to Chinese to use it.
        </p>
      </div>
    );
  }

  const handleStory = ({ story: generated, unknownWords }: StoryResponse) => {
    const text: ReaderText = {
      id: `story-${Date.now()}`,
      title: generated.title,
      titleChinese: generated.titleChinese,
      setting: 'A short story written by the AI from the words you have learned.',
      lesson: currentLesson,
      kind: 'passage',
      lines: generated.lines.map((l) => ({ ...l, speaker: 'Narrator' })),
      generated: true,
    };
    setStory({ text, unknownWords });
    // Never swap out a text the learner is already reading; the story stays listed in the library.
    setOpenText((current) => current ?? text);
  };

  if (openText) {
    return (
      <ReaderView
        key={openText.id}
        text={openText}
        currentLesson={currentLesson}
        unknownWords={openText.generated ? story?.unknownWords : undefined}
        onBack={() => setOpenText(null)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-top">
        <div>
          <div className="greet">读书 · read and tap</div>
          <h1>
            Reader<span className="cjk"> · 阅读</span>
          </h1>
        </div>
        <div className="date">
          Up to lesson {currentLesson}
          <b>{textCount}</b>
          TEXTS
        </div>
      </div>

      <StoryGenerator lesson={currentLesson} onStory={handleStory} />

      {story && (
        <section aria-label="Your story" className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">YOUR STORY</h2>
          <button
            type="button"
            onClick={() => setOpenText(story.text)}
            className="block w-full text-left"
          >
            <span className="block border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
              <span className="flex flex-wrap items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="block font-medium">{story.text.title}</span>
                  <span className="cjk block text-sm text-muted-foreground" lang="zh-CN">
                    {story.text.titleChinese}
                  </span>
                </span>
                <Badge>AI STORY</Badge>
              </span>
            </span>
          </button>
        </section>
      )}

      <ReaderLibrary groups={groups} onOpen={setOpenText} />
    </div>
  );
}
