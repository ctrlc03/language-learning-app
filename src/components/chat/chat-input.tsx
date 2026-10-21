'use client';

import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PinyinKeyboardPanel } from './pinyin-keyboard';
import { keyForKeyPress, usePinyinKeyboard } from '@/hooks/use-pinyin-keyboard';
import { cn } from '@/lib/utils';

/** Longest message the box accepts; the server rejects far longer ones. */
const MAX_INPUT_CHARS = 2000;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Offer the on-screen pinyin keyboard (Chinese conversations). */
  pinyinKeyboard?: boolean;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = 'Type a message...',
  pinyinKeyboard = false,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** Where the caret goes once the keyboard's edit renders. */
  const caret = useRef<number | null>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }, [value, disabled, onSend]);

  const open = pinyinKeyboard && keyboardOpen;
  const keyboard = usePinyinKeyboard(open, {
    insert: (text) => {
      const el = textareaRef.current;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? value.length;
      const next = (value.slice(0, start) + text + value.slice(end)).slice(0, MAX_INPUT_CHARS);
      caret.current = Math.min(start + text.length, next.length);
      setValue(next);
    },
    deleteBack: () => {
      const el = textareaRef.current;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? value.length;
      if (start === end && start === 0) return;
      // A character outside the BMP is two UTF-16 units.
      const low = value.charCodeAt(start - 1);
      const width = start >= 2 && low >= 0xdc00 && low <= 0xdfff ? 2 : 1;
      const from = start === end ? start - width : start;
      caret.current = from;
      setValue(value.slice(0, from) + value.slice(end));
    },
    send: handleSubmit,
  });
  const composing = open && keyboard.typed !== '';

  // Fit the box to its text, and put the caret after what the keyboard typed.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    if (caret.current !== null) {
      textarea.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  }, [value]);

  // With the keyboard open the box keeps focus, so a physical keyboard types into the
  // pinyin too; inputMode="none" keeps a phone's own keyboard from covering it.
  useEffect(() => {
    if (open) textareaRef.current?.focus({ preventScroll: true });
  }, [open]);

  const toggleKeyboard = () => {
    if (keyboardOpen) keyboard.press({ kind: 'clear' });
    setKeyboardOpen(!keyboardOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter confirms an IME candidate (pinyin/kana) while composing; it must not send.
    // keyCode 229 covers browsers that fire keydown after compositionend.
    if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
    if (open && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const key = keyForKeyPress(e.key, composing);
      if (key) {
        e.preventDefault();
        keyboard.press(key);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-card p-3">
      <div className="flex items-end gap-2">
        {pinyinKeyboard && (
          <Button
            type="button"
            variant={keyboardOpen ? 'secondary' : 'ghost'}
            size="icon"
            aria-pressed={keyboardOpen}
            aria-label="Pinyin keyboard"
            title="Pinyin keyboard"
            onClick={toggleKeyboard}
            className="shrink-0 rounded-xl"
          >
            <span aria-hidden="true" className="cjk text-base">
              拼
            </span>
          </Button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          maxLength={MAX_INPUT_CHARS}
          inputMode={open ? 'none' : undefined}
          className={cn(
            'flex-1 min-w-0 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50',
            'disabled:opacity-50 max-h-[150px]',
          )}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value.trim() || composing}
          size="icon"
          className="shrink-0 rounded-xl"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </Button>
      </div>
      {open && (
        <PinyinKeyboardPanel keyboard={keyboard} canSend={!disabled && value.trim() !== ''} />
      )}
    </div>
  );
}
