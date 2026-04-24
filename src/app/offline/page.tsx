import { OfflineResetButton } from '@/components/offline-reset-button';

export const dynamic = 'force-static';

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-6">
      <h1 className="text-2xl font-bold tracking-wider">OFFLINE</h1>
      <p className="max-w-md opacity-80">
        You&apos;re not connected. Cached lessons, vocabulary, and flashcards
        still work — chat and AI-generated exercises need the network.
      </p>
      <OfflineResetButton />
    </main>
  );
}
