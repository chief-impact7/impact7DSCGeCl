import { useState, useEffect, useCallback } from 'react';
import { importHistoryStore } from '../db/metaStore';

/**
 * importHistory 상태 훅.
 * - 초기 로드: IDB META → React state
 * - 변경 저장: React state → IDB (500ms 디바운스)
 */
export function useImportHistory() {
  const [importHistory, setImportHistory] = useState([]);
  const [isLoaded,      setIsLoaded]      = useState(false);

  // 초기 로드
  useEffect(() => {
    importHistoryStore.load().then(h => {
      setImportHistory(h);
      setIsLoaded(true);
    });
  }, []);

  // 변경 → IDB 저장 (500ms 디바운스)
  useEffect(() => {
    if (!isLoaded) return;
    const timeout = setTimeout(() => {
      importHistoryStore.save(importHistory).catch(err =>
        console.error('[idb] importHistory 저장 실패:', err)
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [importHistory, isLoaded]);

  const clear = useCallback(() => {
    setImportHistory([]);
    importHistoryStore.save([]);
  }, []);

  return { importHistory, setImportHistory, isLoaded, clear };
}
