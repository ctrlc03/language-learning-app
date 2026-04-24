'use client';

import { useState } from 'react';

export function OfflineResetButton() {
  const [busy, setBusy] = useState(false);

  const reset = async () => {
    setBusy(true);
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } finally {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition"
      >
        Retry
      </button>
      <button
        type="button"
        onClick={reset}
        disabled={busy}
        className="text-xs opacity-60 hover:opacity-100 underline disabled:opacity-30"
      >
        {busy ? 'Clearing…' : 'Clear cache & reload'}
      </button>
    </div>
  );
}
