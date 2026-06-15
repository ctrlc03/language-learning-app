'use client';

import { StorageProvider } from '@/contexts/StorageContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { TopBar } from '@/components/layout/top-bar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Tweaks } from '@/components/ink/tweaks';
import { langCode } from '@/components/ink/primitives';

function Shell({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const { theme } = useTheme();
  return (
    <div className="app" data-lang={langCode(language)} data-theme={theme}>
      <TopBar />
      <main className="frame" key={langCode(language)}>
        {children}
      </main>
      <MobileNav />
      <Tweaks />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StorageProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Shell>{children}</Shell>
        </LanguageProvider>
      </ThemeProvider>
    </StorageProvider>
  );
}
