'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', cjk: '今', label: 'Today' },
  { href: '/flashcards', cjk: '学', label: 'Study' },
  { href: '/review', cjk: '復', label: 'Review' },
  { href: '/exercises', cjk: '練', label: 'Practice' },
  { href: '/journal', cjk: '記', label: 'Journal' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="ink-mobile-nav md:hidden">
      {NAV_ITEMS.map(item => (
        <Link key={item.href} href={item.href} className={pathname?.startsWith(item.href) ? 'active' : ''}>
          <span className="cjk">{item.cjk}</span>
          <span className="lab">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
