'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_TABS } from './top-bar';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="ink-mobile-nav md:hidden">
      {NAV_TABS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname?.startsWith(item.href) ? 'active' : ''}
        >
          <span className="cjk">{item.cjk}</span>
          <span className="lab">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
