'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechInit } from '@/hooks/use-speech';
import { useProgress } from '@/hooks/use-progress';
import { DictationExercise } from '@/components/listening/dictation-exercise';
import { ListenAndChoose } from '@/components/listening/listen-choose';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Pre-built listening exercises
const DICTATION_SETS = {
  chinese: {
    beginner: [
      { text: '你好', hint: 'A greeting' },
      { text: '谢谢', hint: 'Saying thanks' },
      { text: '我是学生', hint: 'About yourself' },
      { text: '你叫什么名字', hint: 'Asking a question' },
      { text: '今天天气很好', hint: 'About the weather' },
      { text: '我喜欢吃中国菜', hint: 'About food' },
    ],
    intermediate: [
      { text: '请问，去火车站怎么走？', hint: 'Asking directions' },
      { text: '我想学习中文因为我觉得很有意思', hint: 'About learning' },
      { text: '昨天晚上我和朋友一起看了电影', hint: 'Past activity' },
      { text: '这个周末你有什么计划吗？', hint: 'Weekend plans' },
    ],
    advanced: [
      { text: '随着科技的发展，人们的生活方式发生了很大的变化', hint: 'About technology' },
      { text: '虽然学习外语很难，但是只要坚持就一定能学好', hint: 'About perseverance' },
    ],
  },
  japanese: {
    beginner: [
      { text: 'こんにちは', hint: 'A greeting' },
      { text: 'ありがとうございます', hint: 'Saying thanks' },
      { text: '私は学生です', hint: 'About yourself' },
      { text: 'お名前は何ですか', hint: 'Asking a question' },
      { text: '今日はいい天気ですね', hint: 'About the weather' },
      { text: '日本料理が好きです', hint: 'About food' },
    ],
    intermediate: [
      { text: 'すみません、駅はどこですか？', hint: 'Asking directions' },
      { text: '日本語を勉強しているのは面白いからです', hint: 'About learning' },
      { text: '昨日友達と映画を見ました', hint: 'Past activity' },
      { text: '週末は何をする予定ですか？', hint: 'Weekend plans' },
    ],
    advanced: [
      { text: '技術の発展に伴い、人々のライフスタイルは大きく変化しました', hint: 'About technology' },
      { text: '外国語の勉強は難しいですが、続ければ必ず上達します', hint: 'About perseverance' },
    ],
  },
};

const LISTEN_CHOOSE_SETS = {
  chinese: {
    beginner: [
      { text: '我想喝一杯水', question: 'What does the speaker want?', options: ['A cup of tea', 'A glass of water', 'Some coffee', 'A juice'], correctIndex: 1 },
      { text: '今天是星期三', question: 'What day is it?', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], correctIndex: 2 },
      { text: '苹果三块钱一斤', question: 'What is being discussed?', options: ['Orange price', 'Apple price', 'Banana price', 'Grape price'], correctIndex: 1 },
    ],
    intermediate: [
      { text: '下个月我打算去北京旅游', question: 'When is the speaker traveling?', options: ['This week', 'This month', 'Next month', 'Next year'], correctIndex: 2 },
    ],
    advanced: [
      { text: '这部电影的评价不太好，但是我觉得导演很有创意', question: 'What does the speaker think?', options: ['The movie is great', 'The director is creative', 'The reviews are good', 'The story is boring'], correctIndex: 1 },
    ],
  },
  japanese: {
    beginner: [
      { text: '水を一杯ください', question: 'What does the speaker want?', options: ['A cup of tea', 'A glass of water', 'Some coffee', 'A juice'], correctIndex: 1 },
      { text: '今日は水曜日です', question: 'What day is it?', options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], correctIndex: 2 },
      { text: 'りんごは一つ百円です', question: 'What is being discussed?', options: ['Orange price', 'Apple price', 'Banana price', 'Grape price'], correctIndex: 1 },
    ],
    intermediate: [
      { text: '来月東京に旅行に行く予定です', question: 'When is the speaker traveling?', options: ['This week', 'This month', 'Next month', 'Next year'], correctIndex: 2 },
    ],
    advanced: [
      { text: 'この映画の評価はあまり良くないですが、監督はとても創造的だと思います', question: 'What does the speaker think?', options: ['The movie is great', 'The director is creative', 'The reviews are good', 'The story is boring'], correctIndex: 1 },
    ],
  },
};

type ExerciseMode = 'select' | 'dictation' | 'listen-choose';

export default function ListeningPage() {
  const { language, difficulty } = useLanguage();
  const { recordActivity } = useProgress();
  const [mode, setMode] = useState<ExerciseMode>('select');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  useSpeechInit();

  const dictationSet = DICTATION_SETS[language][difficulty] ?? DICTATION_SETS[language].beginner;
  const listenChooseSet = LISTEN_CHOOSE_SETS[language][difficulty] ?? LISTEN_CHOOSE_SETS[language].beginner;

  const handleComplete = (correct: boolean) => {
    setSessionTotal(prev => prev + 1);
    if (correct) setSessionCorrect(prev => prev + 1);
    recordActivity({
      exercises: 1,
      correctAnswers: correct ? 1 : 0,
      totalAnswers: 1,
    });
  };

  const handleNext = () => {
    const maxIndex = mode === 'dictation' ? dictationSet.length - 1 : listenChooseSet.length - 1;
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setMode('select');
      setCurrentIndex(0);
    }
  };

  if (mode === 'select') {
    return (
      <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listening Practice</h1>
          <p className="text-muted-foreground mt-1">
            Train your ear for {language === 'chinese' ? 'Chinese' : 'Japanese'}
          </p>
        </div>

        {sessionTotal > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Last session: {sessionCorrect}/{sessionTotal} correct</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => { setMode('dictation'); setCurrentIndex(0); }} className="text-left">
            <Card className="p-6 hover:border-primary/50 hover:bg-primary/5 transition-all h-full">
              <div className="text-3xl mb-2">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <h3 className="font-semibold">Dictation</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Listen and type what you hear ({dictationSet.length} exercises)
              </p>
            </Card>
          </button>

          <button onClick={() => { setMode('listen-choose'); setCurrentIndex(0); }} className="text-left">
            <Card className="p-6 hover:border-primary/50 hover:bg-primary/5 transition-all h-full">
              <div className="text-3xl mb-2">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h3 className="font-semibold">Listen & Choose</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Listen and select the correct answer ({listenChooseSet.length} exercises)
              </p>
            </Card>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'dictation') {
    const exercise = dictationSet[currentIndex];
    return (
      <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode('select')}>
            &larr; Back
          </Button>
          <Badge variant="outline">
            {currentIndex + 1} / {dictationSet.length}
          </Badge>
        </div>
        <DictationExercise
          key={currentIndex}
          text={exercise.text}
          hint={exercise.hint}
          onComplete={handleComplete}
        />
        <div className="text-center">
          <Button variant="outline" onClick={handleNext}>
            {currentIndex < dictationSet.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'listen-choose') {
    const exercise = listenChooseSet[currentIndex];
    return (
      <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setMode('select')}>
            &larr; Back
          </Button>
          <Badge variant="outline">
            {currentIndex + 1} / {listenChooseSet.length}
          </Badge>
        </div>
        <ListenAndChoose
          key={currentIndex}
          text={exercise.text}
          question={exercise.question}
          options={exercise.options}
          correctIndex={exercise.correctIndex}
          onComplete={handleComplete}
        />
        <div className="text-center">
          <Button variant="outline" onClick={handleNext}>
            {currentIndex < listenChooseSet.length - 1 ? 'Next' : 'Finish'}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
