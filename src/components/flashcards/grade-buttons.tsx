'use client';

import { Button } from '@/components/ui/button';
import type { SRSGrade } from '@/types';
import { cn } from '@/lib/utils';

interface GradeButtonsProps {
  onGrade: (grade: SRSGrade) => void;
  disabled?: boolean;
}

const GRADES: { grade: SRSGrade; label: string; color: string; description: string }[] = [
  { grade: 1, label: 'Again', color: 'bg-destructive text-white hover:bg-destructive/90', description: '< 1 min' },
  { grade: 3, label: 'Hard', color: 'bg-accent text-accent-foreground hover:bg-accent/90', description: '~1 day' },
  { grade: 4, label: 'Good', color: 'bg-primary text-primary-foreground hover:bg-primary/90', description: 'Next interval' },
  { grade: 5, label: 'Easy', color: 'bg-success text-white hover:bg-success/90', description: 'Long interval' },
];

export function GradeButtons({ onGrade, disabled }: GradeButtonsProps) {
  return (
    <div className="flex gap-2 justify-center">
      {GRADES.map(({ grade, label, color, description }) => (
        <button
          key={grade}
          onClick={() => onGrade(grade)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50',
            color
          )}
        >
          <span>{label}</span>
          <span className="text-[10px] opacity-80">{description}</span>
        </button>
      ))}
    </div>
  );
}
