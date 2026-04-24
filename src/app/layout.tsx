import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Orbitron, Noto_Serif_JP, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { PWARegister } from '@/components/pwa-register';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '700', '900'],
});

const notoSerifJP = Noto_Serif_JP({
  variable: '--font-noto-serif-jp',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700', '900'],
});

const notoSerifSC = Noto_Serif_SC({
  variable: '--font-noto-serif-sc',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700', '900'],
});

export const metadata: Metadata = {
  title: 'KOTOBA.EXE · Neon Language Deck',
  description: 'AI-powered language learning for Chinese and Japanese',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KOTOBA.EXE',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} ${orbitron.variable} ${notoSerifJP.variable} ${notoSerifSC.variable} antialiased scanlines`}>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
