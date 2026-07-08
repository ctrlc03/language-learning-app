'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProgress } from '@/hooks/use-progress';

export const NAV_TABS = [
  { href: '/dashboard', cjk: '今', label: 'Today' },
  { href: '/flashcards', cjk: '学', label: 'Study' },
  { href: '/learn', cjk: '教', label: 'Learn' },
  { href: '/review', cjk: '復', label: 'Review' },
  { href: '/exercises', cjk: '練', label: 'Practice' },
  { href: '/listening', cjk: '聴', label: 'Listen' },
  { href: '/tones', cjk: '声', label: 'Tones' },
  { href: '/writing', cjk: '書', label: 'Write' },
  { href: '/measure-words', cjk: '量', label: 'Classifiers' },
  { href: '/progress', cjk: '弱', label: 'Weak Spots' },
  { href: '/chat', cjk: '話', label: 'Chat' },
  { href: '/vocabulary', cjk: '庫', label: 'Archive' },
  { href: '/journal', cjk: '記', label: 'Journal' },
];

export function TopBar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { progress } = useProgress();

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/dashboard" className="brand" style={{ textDecoration: 'none' }}>
          <div className="seal" />
          <div className="name">
            INKPATH
            <small>墨 · 言葉の道</small>
          </div>
        </Link>

        <nav className="nav">
          {NAV_TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={pathname?.startsWith(t.href) ? 'active' : ''}
            >
              <span className="cjk">{t.cjk}</span>
              {t.label}
            </Link>
          ))}
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
            設
          </Link>
        </div>
      </div>
    </div>
  );
}
