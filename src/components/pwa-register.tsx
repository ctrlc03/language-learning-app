'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    // The SW calls skipWaiting() on install, so after a deploy a new worker takes
    // control of a page still running the previous build's HTML. Its lazy chunk
    // URLs no longer exist → ChunkLoadError on the next navigation. Reload once
    // when control changes so document and chunks stay in sync.
    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    // Only arm the reload if a worker was already in control — on first-ever
    // registration controllerchange fires normally and a reload would be noise.
    const armed = Boolean(navigator.serviceWorker.controller);
    if (armed) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }

    return () => {
      if (armed) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
    };
  }, []);

  return null;
}
