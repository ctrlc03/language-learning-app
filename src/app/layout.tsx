import type { Metadata, Viewport } from 'next';
import { Shippori_Mincho_B1, Noto_Serif_SC, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';
import { PWARegister } from '@/components/pwa-register';

const shippori = Shippori_Mincho_B1({
  variable: '--font-shippori',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const notoSerifSC = Noto_Serif_SC({
  variable: '--font-noto-serif-sc',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '700', '900'],
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: '--font-zen',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
  // Shared by Chinese and Japanese mode; the header subtitle carries the language.
  title: 'INKPATH · 墨',
  description: 'Paper-and-ink language study for Chinese and Japanese',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/inkpath/seal-jp.png' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'INKPATH',
  },
};

export const viewport: Viewport = {
  themeColor: '#e9e3d4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${shippori.variable} ${notoSerifSC.variable} ${zenKaku.variable} antialiased`}
      >
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
