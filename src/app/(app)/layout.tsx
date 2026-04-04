'use client';

import { StorageProvider } from '@/contexts/StorageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StorageProvider>
      <ThemeProvider>
        <LanguageProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <main className="flex-1 pb-20 md:pb-0">
                {children}
              </main>
            </div>
            <MobileNav />
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </StorageProvider>
  );
}
