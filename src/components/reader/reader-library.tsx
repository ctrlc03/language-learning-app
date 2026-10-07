'use client';

import { Badge } from '@/components/ui/badge';
import type { ReaderEntry, ReaderLessonGroup } from '@/lib/reader/library';

interface ReaderLibraryProps {
  groups: ReaderLessonGroup[];
  onOpen: (entry: ReaderEntry) => void;
}

/** Every text up to the current lesson, newest lesson first. */
export function ReaderLibrary({ groups, onOpen }: ReaderLibraryProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.lesson} aria-label={`Lesson ${group.lesson}`} className="space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
            LESSON {group.lesson}
          </h2>
          <ul className="space-y-2">
            {group.entries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onOpen(entry)}
                  className="block w-full text-left"
                >
                  <span className="block border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5">
                    <span className="flex flex-wrap items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block font-medium">{entry.title}</span>
                        <span className="cjk block text-sm text-muted-foreground" lang="zh-CN">
                          {entry.titleChinese}
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={entry.kind === 'passage' ? 'default' : 'outline'}>
                          {entry.kind === 'passage' ? 'PASSAGE' : 'DIALOGUE'}
                        </Badge>
                        <Badge variant="outline">{entry.lines.length} LINES</Badge>
                        <Badge variant={entry.coverage.percent >= 95 ? 'success' : 'warning'}>
                          {entry.coverage.percent}% known
                        </Badge>
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
