'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { NAV_ENTRIES, isTabActive, navGlyph } from './top-bar';
import { useNavMenu } from './use-nav-menu';

export function MobileNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const navRef = useRef<HTMLElement>(null);
  const { openId, toggle, close } = useNavMenu(navRef);

  return (
    <nav className="ink-mobile-nav md:hidden" aria-label="Main" ref={navRef}>
      {NAV_ENTRIES.map((entry) => {
        const active = entry.tabs.some((tab) => isTabActive(pathname, tab.href));
        const body = (
          <>
            <span className="cjk">{navGlyph(entry, language)}</span>
            <span className="lab">{entry.label}</span>
          </>
        );
        if (entry.tabs.length === 1) {
          return (
            <Link
              key={entry.id}
              href={entry.tabs[0].href}
              className={active ? 'active' : ''}
              aria-current={active ? 'page' : undefined}
              onClick={close}
            >
              {body}
            </Link>
          );
        }
        const open = openId === entry.id;
        const menuId = `mobile-nav-menu-${entry.id}`;
        return (
          <div key={entry.id} className="mobile-nav-group">
            <button
              type="button"
              className={active ? 'active' : ''}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => toggle(entry.id)}
            >
              {body}
            </button>
            <div className="mobile-nav-sheet" id={menuId} hidden={!open}>
              {entry.tabs.map((tab) => {
                const tabActive = isTabActive(pathname, tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={tabActive ? 'active' : ''}
                    aria-current={tabActive ? 'page' : undefined}
                    onClick={close}
                  >
                    <span className="cjk">{navGlyph(tab, language)}</span>
                    <span className="lab">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
