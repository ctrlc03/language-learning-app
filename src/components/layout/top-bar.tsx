'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProgress } from '@/hooks/use-progress';
import type { Language } from '@/types';
import { useNavMenu } from './use-nav-menu';

// Every route in the app, flat and in nav order. scripts/build-sw.mjs regex-parses this literal
// for `href: '...'`, so keep it a plain array of object literals.
// `cjkZh` is the simplified form shown in Chinese mode when the Japanese glyph differs.
export const NAV_TABS = [
  { href: '/dashboard', group: 'today', cjk: '今', label: 'Today' },
  { href: '/session', group: 'study', cjk: '道', label: 'Session' },
  { href: '/flashcards', group: 'study', cjk: '学', label: 'Study' },
  { href: '/review', group: 'study', cjk: '復', cjkZh: '复', label: 'Review' },
  { href: '/learn', group: 'study', cjk: '教', label: 'Learn' },
  { href: '/exercises', group: 'practice', cjk: '練', cjkZh: '练', label: 'Practice' },
  { href: '/listening', group: 'practice', cjk: '聴', cjkZh: '听', label: 'Listen' },
  { href: '/tones', group: 'practice', cjk: '声', label: 'Tones' },
  { href: '/writing', group: 'practice', cjk: '書', cjkZh: '写', label: 'Write' },
  { href: '/measure-words', group: 'practice', cjk: '量', label: 'Classifiers' },
  { href: '/typing', group: 'practice', cjk: '拼', label: 'Typing' },
  { href: '/numbers', group: 'practice', cjk: '数', label: 'Numbers' },
  { href: '/chat', group: 'chat', cjk: '話', cjkZh: '话', label: 'Chat' },
  { href: '/progress', group: 'progress', cjk: '弱', label: 'Weak Spots' },
  { href: '/vocabulary', group: 'progress', cjk: '庫', cjkZh: '库', label: 'Archive' },
  { href: '/journal', group: 'progress', cjk: '記', cjkZh: '记', label: 'Journal' },
];

interface Glyphed {
  cjk: string;
  cjkZh?: string;
}

export function navGlyph(item: Glyphed, language: Language): string {
  return language === 'chinese' && item.cjkZh ? item.cjkZh : item.cjk;
}

export function isTabActive(pathname: string | null, href: string): boolean {
  return pathname === href || !!pathname?.startsWith(`${href}/`);
}

const NAV_GROUPS = [
  { id: 'today', label: 'Today', cjk: '今' },
  { id: 'study', label: 'Study', cjk: '学' },
  { id: 'practice', label: 'Practice', cjk: '練', cjkZh: '练' },
  { id: 'chat', label: 'Chat', cjk: '話', cjkZh: '话' },
  { id: 'progress', label: 'Progress', cjk: '進', cjkZh: '进' },
];

/** The nav as the UI shows it: a group with one tab is a plain link, otherwise a menu. */
export const NAV_ENTRIES = NAV_GROUPS.map((group) => ({
  ...group,
  tabs: NAV_TABS.filter((tab) => tab.group === group.id),
}));

export function TopBar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { progress } = useProgress();
  const navRef = useRef<HTMLElement>(null);
  const { openId, toggle, close } = useNavMenu(navRef);
  const isJapanese = language === 'japanese';

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/dashboard" className="brand" style={{ textDecoration: 'none' }}>
          <div className="seal" />
          <div className="name">
            INKPATH
            <small>{isJapanese ? '墨 · 言葉の道' : '墨 · 学中文'}</small>
          </div>
        </Link>

        <nav className="nav" aria-label="Main" ref={navRef}>
          {NAV_ENTRIES.map((entry) => {
            const active = entry.tabs.some((tab) => isTabActive(pathname, tab.href));
            if (entry.tabs.length === 1) {
              const [tab] = entry.tabs;
              return (
                <Link
                  key={entry.id}
                  href={tab.href}
                  className={active ? 'active' : ''}
                  aria-current={active ? 'page' : undefined}
                  onClick={close}
                >
                  <span className="cjk">{navGlyph(tab, language)}</span>
                  {entry.label}
                </Link>
              );
            }
            const open = openId === entry.id;
            const menuId = `nav-menu-${entry.id}`;
            return (
              <div key={entry.id} className="nav-group">
                <button
                  type="button"
                  className={active ? 'active' : ''}
                  aria-expanded={open}
                  aria-controls={menuId}
                  onClick={() => toggle(entry.id)}
                >
                  <span className="cjk">{navGlyph(entry, language)}</span>
                  {entry.label}
                  <span className="chev" aria-hidden="true" />
                </button>
                <div className="nav-menu" id={menuId} hidden={!open}>
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
                        {tab.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="topbar-right">
          <div className="streak-chip">
            <span className="mark">炎</span>
            {progress.streak}
            <small>day streak</small>
          </div>
          <div className="lang-toggle">
            <button
              className={language === 'japanese' ? 'on' : ''}
              onClick={() => setLanguage('japanese')}
            >
              日
            </button>
            <button
              className={language === 'chinese' ? 'on' : ''}
              onClick={() => setLanguage('chinese')}
            >
              中
            </button>
          </div>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link
            href="/settings"
            className={`icon-btn ${pathname?.startsWith('/settings') ? 'active' : ''}`}
            aria-label="Settings"
          >
            {isJapanese ? '設' : '设'}
          </Link>
        </div>
      </div>
    </div>
  );
}
