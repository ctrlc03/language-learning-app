'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { japaneseVocabulary } from '@/data/japanese/vocabulary';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { CJKText } from '@/components/shared/cjk-text';
import type { VocabularyItem } from '@/types';

export default function VocabularyPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  useSpeechInit();

  const allVocab = language === 'chinese' ? chineseVocabulary : japaneseVocabulary;

  // Build levels with counts from actual data
  const levelCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of allVocab) {
      if (v.level) {
        counts.set(v.level, (counts.get(v.level) || 0) + 1);
      }
    }
    return counts;
  }, [allVocab]);

  const levels = useMemo(() => {
    return Array.from(levelCounts.keys()).sort((a, b) => {
      // Sort HSK/JLPT first, then Lessons/Irodori
      const aIsStandard = a.startsWith('HSK') || a.startsWith('JLPT');
      const bIsStandard = b.startsWith('HSK') || b.startsWith('JLPT');
      if (aIsStandard && !bIsStandard) return -1;
      if (!aIsStandard && bIsStandard) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [levelCounts]);

  const topics = useMemo(() => {
    const topicSet = new Set(allVocab.map(v => v.topic).filter(Boolean));
    return Array.from(topicSet).sort() as string[];
  }, [allVocab]);

  const filtered = useMemo(() => {
    return allVocab.filter(item => {
      if (selectedLevel !== 'all' && item.level !== selectedLevel) return false;
      if (selectedTopic !== 'all' && item.topic !== selectedTopic) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.word.toLowerCase().includes(q) ||
          item.reading.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allVocab, selectedLevel, selectedTopic, search]);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        <p className="text-muted-foreground mt-1">
          {allVocab.length} words · {language === 'chinese' ? 'Chinese' : 'Japanese'}
        </p>
      </div>

      {/* Level summary badges */}
      <div className="flex flex-wrap gap-1.5">
        {levels.map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(selectedLevel === level ? 'all' : level)}
            className="inline-flex"
          >
            <Badge
              variant={selectedLevel === level ? 'default' : 'outline'}
              className="text-xs cursor-pointer"
            >
              {level} ({levelCounts.get(level)})
            </Badge>
          </button>
        ))}
        {selectedLevel !== 'all' && (
          <button onClick={() => setSelectedLevel('all')} className="inline-flex">
            <Badge variant="outline" className="text-xs cursor-pointer">
              Clear filter
            </Badge>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search words..."
          className="w-full sm:w-48"
        />
        <select
          value={selectedLevel}
          onChange={e => setSelectedLevel(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">All Levels ({allVocab.length})</option>
          {levels.map(level => (
            <option key={level} value={level}>
              {level} ({levelCounts.get(level)})
            </option>
          ))}
        </select>
        <select
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">All Topics</option>
          {topics.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {allVocab.length} words
      </p>

      {/* Word list */}
      <div className="space-y-2">
        {filtered.slice(0, 200).map(item => (
          <VocabCard key={item.id} item={item} />
        ))}

        {filtered.length > 200 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Showing first 200 of {filtered.length} results. Use search or filters to narrow down.
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No matching vocabulary found
          </div>
        )}
      </div>
    </div>
  );
}

function VocabCard({ item }: { item: VocabularyItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className="cursor-pointer hover:border-primary/30 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CJKText text={item.word} reading={item.reading} className="text-xl font-bold" />
            <div>
              <p className="text-sm text-muted-foreground">{item.reading}</p>
              <p className="text-sm font-medium">{item.meaning}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.level && <Badge variant="outline" className="text-xs">{item.level}</Badge>}
            <div onClick={e => e.stopPropagation()}>
              <SpeakButton text={item.word} />
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
            {item.partOfSpeech && (
              <p className="text-muted-foreground">Part of speech: {item.partOfSpeech}</p>
            )}
            {item.topic && (
              <p className="text-muted-foreground">Topic: {item.topic}</p>
            )}
            {item.exampleSentence && (
              <div className="mt-2 p-2 bg-muted rounded-lg">
                <p>{item.exampleSentence}</p>
                {item.exampleTranslation && (
                  <p className="text-muted-foreground mt-0.5">{item.exampleTranslation}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
