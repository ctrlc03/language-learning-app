'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface CJKTextProps {
  text: string;
  reading?: string;
  className?: string;
  showReading?: boolean; // override global setting
}

export function CJKText({ text, reading, className, showReading: showOverride }: CJKTextProps) {
  const { showAnnotations } = useLanguage();
  const show = showOverride ?? showAnnotations;

  if (!show || !reading) {
    return <span className={cn('text-lg', className)}>{text}</span>;
  }

  // Split reading by spaces to match characters
  // Simple approach: if reading has same number of space-separated parts as text chars, annotate each
  const readingParts = reading.split(/\s+/);
  const textChars = [...text];

  if (readingParts.length === textChars.length) {
    return (
      <span className={cn('text-lg', className)}>
        {textChars.map((char, i) => (
          <ruby key={i}>
            {char}
            <rt>{readingParts[i]}</rt>
          </ruby>
        ))}
      </span>
    );
  }

  // Fallback: show reading as a single annotation
  return (
    <span className={cn('text-lg', className)}>
      <ruby>
        {text}
        <rt>{reading}</rt>
      </ruby>
    </span>
  );
}
