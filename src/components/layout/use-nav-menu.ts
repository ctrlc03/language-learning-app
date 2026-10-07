'use client';

import { useEffect, useState, type RefObject } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Which of the nav's popup menus is open (one at a time). A menu closes on a press outside
 * `containerRef`, when focus tabs out of it, on Escape (focus goes back to its button) and when
 * the route changes.
 */
export function useNavMenu(containerRef: RefObject<HTMLElement | null>) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setOpenId(null);
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!openId || !container) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.contains(event.target as Node)) setOpenId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      container.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus();
      setOpenId(null);
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && !container.contains(next)) setOpenId(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    container.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('focusout', onFocusOut);
    };
  }, [openId, containerRef]);

  return {
    openId,
    toggle: (id: string) => setOpenId(openId === id ? null : id),
    close: () => setOpenId(null),
  };
}
