'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Signal', glyph: '信' },
  { href: '/chat', label: 'Chat', glyph: '送' },
  { href: '/exercises', label: 'Drill', glyph: '波' },
  { href: '/flashcards', label: 'Cards', glyph: '衰' },
  { href: '/vocabulary', label: 'Vocab', glyph: '庫' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border"
      style={{ background: 'oklch(0.10 0.04 285 / 0.95)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(item => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span className={cn('cjk-jp text-lg leading-none', isActive && 'neon-text-pink')}>
                {item.glyph}
              </span>
              <span className="text-[9px] tracking-[0.15em] uppercase font-display">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full mt-0.5"
                  style={{ background: 'var(--neon-pink)', boxShadow: '0 0 6px var(--neon-pink)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
