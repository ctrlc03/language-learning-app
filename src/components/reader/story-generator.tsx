'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MAX_STORY_TOPIC_LENGTH, type StoryRequest, type StoryResponse } from '@/lib/reader/story';

interface StoryGeneratorProps {
  lesson: number;
  onStory: (response: StoryResponse) => void;
}

const OFFLINE_MESSAGE = 'Could not reach the story service. The library below still works offline.';

function isStoryResponse(value: unknown): value is StoryResponse {
  if (!value || typeof value !== 'object' || !('story' in value)) return false;
  const story: unknown = value.story;
  return !!story && typeof story === 'object' && 'lines' in story && Array.isArray(story.lines);
}

/** Asks the AI for a short story built from the words the course has taught so far. */
export function StoryGenerator({ lesson, onStory }: StoryGeneratorProps) {
  const topicId = useId();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const controller = useRef<AbortController | null>(null);

  // A story that finishes after the learner has left must not open anywhere.
  useEffect(() => () => controller.current?.abort(), []);

  const generate = async () => {
    controller.current?.abort();
    const own = new AbortController();
    controller.current = own;
    setLoading(true);
    setError(null);
    try {
      const body: StoryRequest = { lesson, topic: topic.trim() || undefined };
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: own.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      if (own.signal.aborted) return;
      if (!res.ok) {
        const message =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : 'Could not write a story. Try again.';
        setError(message);
        return;
      }
      if (!isStoryResponse(data)) {
        setError('The story came back in an unexpected shape. Try again.');
        return;
      }
      onStory(data);
    } catch {
      if (!own.signal.aborted) setError(OFFLINE_MESSAGE);
    } finally {
      if (!own.signal.aborted) setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div>
          <h2 className="font-semibold">
            New story<span className="cjk text-muted-foreground"> · 新故事</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            The AI writes a short story using only words up to lesson {lesson}. Needs a network
            connection and an API key.
          </p>
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) void generate();
          }}
        >
          <div className="min-w-48 flex-1">
            <label htmlFor={topicId} className="mb-1 block text-xs text-muted-foreground">
              Topic (optional)
            </label>
            <Input
              id={topicId}
              type="text"
              value={topic}
              maxLength={MAX_STORY_TOPIC_LENGTH}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. a trip to the market"
            />
          </div>
          <Button type="submit" disabled={loading}>
            <span>{loading ? 'Writing…' : 'New story'}</span>
          </Button>
        </form>
        {error && (
          <p
            role="alert"
            className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
