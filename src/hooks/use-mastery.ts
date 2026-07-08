'use client';

import { useCallback, useEffect, useState } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { applyResult, type MasteryDomain, type MasteryMap, type MasteryMeta } from '@/lib/mastery';

const keyFor = (d: MasteryDomain) => `langbot:mastery:${d}`;

export function useMastery(domain: MasteryDomain) {
  const storage = useStorage();
  const [map, setMap] = useState<MasteryMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = await storage.get<MasteryMap>(keyFor(domain));
      if (alive) {
        setMap(saved ?? {});
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [storage, domain]);

  const record = useCallback(
    (id: string, correct: boolean, meta: MasteryMeta) => {
      setMap((prev) => {
        const next = applyResult(prev, id, correct, meta, Date.now());
        void storage.set(keyFor(domain), next);
        return next;
      });
    },
    [storage, domain],
  );

  return { map, loading, record };
}
