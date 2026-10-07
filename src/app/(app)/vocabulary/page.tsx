'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { chineseVocabulary } from '@/data/chinese/vocabulary';
import { japaneseVocabulary } from '@/data/japanese/vocabulary';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpeakButton } from '@/components/shared/speak-button';
import { CJKText } from '@/components/shared/cjk-text';
import type { Language, VocabularyItem } from '@/types';

type Mode = 'lookup' | 'archive';

export default function VocabularyPage() {
  const { language } = useLanguage();
  const [mode, setMode] = useState<Mode>('lookup');
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
    const topicSet = new Set(allVocab.map((v) => v.topic).filter(Boolean));
    return Array.from(topicSet).sort() as string[];
  }, [allVocab]);

  const filtered = useMemo(() => {
    return allVocab.filter((item) => {
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
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="page-top">
        <div>
          <div className="greet">
            {language === 'japanese' ? '言葉を集める' : '词汇库'} · the word archive
          </div>
          <h1>
            Archive<span className="cjk"> · {language === 'japanese' ? '蔵' : '藏'}</span>
          </h1>
        </div>
        <div className="date">
          {language === 'chinese' ? '中文' : '日本語'}
          <b>{allVocab.length}</b>
          words indexed
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'lookup' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMode('lookup')}
        >
          典 Lookup
        </Button>
        <Button
          variant={mode === 'archive' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMode('archive')}
        >
          {language === 'japanese' ? '庫' : '库'} Archive
        </Button>
      </div>

      {mode === 'lookup' ? (
        <LookupPanel language={language} allVocab={allVocab} />
      ) : (
        <ArchivePanel
          allVocab={allVocab}
          search={search}
          setSearch={setSearch}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          levels={levels}
          levelCounts={levelCounts}
          topics={topics}
          filtered={filtered}
        />
      )}
    </div>
  );
}

function LookupPanel({ language, allVocab }: { language: Language; allVocab: VocabularyItem[] }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = allVocab
      .map((item) => {
        const meaning = item.meaning.toLowerCase();
        const reading = item.reading.toLowerCase();
        const word = item.word.toLowerCase();
        let score = -1;
        // Prefer exact English meaning matches, then prefix, then substring.
        if (meaning === q || meaning.split(/[,;/]\s*/).includes(q)) score = 0;
        else if (meaning.startsWith(q)) score = 1;
        else if (meaning.includes(q)) score = 2;
        else if (word === q || reading === q || reading.replace(/\s+/g, '') === q) score = 3;
        else if (word.includes(q) || reading.includes(q)) score = 4;
        return { item, score };
      })
      .filter((r) => r.score >= 0)
      .sort((a, b) => a.score - b.score);
    return scored.slice(0, 50).map((r) => r.item);
  }, [query, allVocab]);

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          language === 'chinese'
            ? 'Look up a word (English, pinyin, or character)…'
            : 'Look up a word (English, reading, or kanji)…'
        }
        className="w-full"
      />

      <p className="text-xs text-muted-foreground">
        {language === 'chinese' ? 'English → pinyin → character' : 'English → reading → kanji'}
      </p>

      {query.trim() && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No matching words found for “{query.trim()}”.
        </div>
      )}

      <div className="space-y-2">
        {results.map((item) => (
          <LookupCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function LookupCard({ item }: { item: VocabularyItem }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{item.meaning}</p>
            <p className="text-sm text-muted-foreground">{item.reading}</p>
            <div className="mt-1">
              <CJKText text={item.word} reading={item.reading} className="text-3xl font-bold" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item.partOfSpeech && (
              <Badge variant="outline" className="text-xs">
                {item.partOfSpeech}
              </Badge>
            )}
            {item.level && (
              <Badge variant="outline" className="text-xs">
                {item.level}
              </Badge>
            )}
            <SpeakButton text={item.word} />
          </div>
        </div>

        {item.exampleSentence && (
          <div className="p-2 bg-muted rounded-lg text-sm space-y-0.5">
            <div className="flex items-center gap-2">
              <CJKText text={item.exampleSentence} reading={item.examplePinyin} />
              <div onClick={(e) => e.stopPropagation()}>
                <SpeakButton text={item.exampleSentence} />
              </div>
            </div>
            {item.examplePinyin && <p className="text-muted-foreground">{item.examplePinyin}</p>}
            {item.exampleTranslation && (
              <p className="text-muted-foreground">{item.exampleTranslation}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ArchivePanelProps {
  allVocab: VocabularyItem[];
  search: string;
  setSearch: (s: string) => void;
  selectedLevel: string;
  setSelectedLevel: (s: string) => void;
  selectedTopic: string;
  setSelectedTopic: (s: string) => void;
  levels: string[];
  levelCounts: Map<string, number>;
  topics: string[];
  filtered: VocabularyItem[];
}

function ArchivePanel({
  allVocab,
  search,
  setSearch,
  selectedLevel,
  setSelectedLevel,
  selectedTopic,
  setSelectedTopic,
  levels,
  levelCounts,
  topics,
  filtered,
}: ArchivePanelProps) {
  return (
    <div className="space-y-6">
      {/* Level summary badges */}
      <div className="flex flex-wrap gap-1.5">
        {levels.map((level) => (
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words..."
          className="w-full sm:w-48"
        />
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">All Levels ({allVocab.length})</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level} ({levelCounts.get(level)})
            </option>
          ))}
        </select>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {allVocab.length} words
      </p>

      {/* Word list */}
      <div className="space-y-2">
        {filtered.slice(0, 200).map((item) => (
          <VocabCard key={item.id} item={item} />
        ))}

        {filtered.length > 200 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Showing first 200 of {filtered.length} results. Use search or filters to narrow down.
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No matching vocabulary found</div>
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
            {item.level && (
              <Badge variant="outline" className="text-xs">
                {item.level}
              </Badge>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={item.word} />
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
            {item.partOfSpeech && (
              <p className="text-muted-foreground">Part of speech: {item.partOfSpeech}</p>
            )}
            {item.topic && <p className="text-muted-foreground">Topic: {item.topic}</p>}
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
