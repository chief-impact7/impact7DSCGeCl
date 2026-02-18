import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionStore } from '../db/sessionStore';
import { gasBuffer, flushOutbox } from '../db/gasBuffer';
import { normalizeSession, deduplicateSessions } from '../db/normalize';

/**
 * IndexedDB 기반 세션 상태 훅.
 * - 초기 로드: IDB → React state
 * - 변경 저장: React state 변경 → IDB (300ms 디바운스)
 * - outbox 주기 확인: 30초 인터벌
 * - 탭 포커스 복귀 시 outbox 자동 flush
 *
 * @param {string} gasUrl  GAS Web App URL
 */
export function useSessions(gasUrl) {
  const [sessions,     setSessions]     = useState([]);
  const [isLoaded,     setIsLoaded]     = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const prevSessionsRef = useRef([]);

  // ── 초기 로드 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored     = await sessionStore.getAll();
        const normalized = deduplicateSessions(stored.map(normalizeSession));
        if (!cancelled) {
          setSessions(normalized);
          prevSessionsRef.current = normalized;
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('[useSessions] 초기 로드 실패:', err);
        if (!cancelled) setIsLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 세션 변경 → IDB 저장 (300ms 디바운스) ─────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const prev = prevSessionsRef.current;
    if (sessions === prev) return;

    const timeout = setTimeout(async () => {
      try {
        const written = await sessionStore.bulkUpsert(sessions, prev);
        if (written > 0) console.debug(`[idb] ${written}개 세션 저장 완료`);
        prevSessionsRef.current = sessions;
      } catch (err) {
        console.error('[idb] 세션 저장 실패:', err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [sessions, isLoaded]);

  // ── outbox 대기 건수 (30초 인터벌) ────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    const check = async () => setPendingCount(await gasBuffer.pendingCount());
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [isLoaded]);

  // ── 탭 포커스 복귀 시 outbox flush ────────────────────────────────────────
  useEffect(() => {
    if (!gasUrl) return;
    const onFocus = () => {
      flushOutbox(gasUrl).then(({ success }) => {
        if (success > 0) gasBuffer.pendingCount().then(setPendingCount);
      });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [gasUrl]);

  // ── Cloud → IDB 수동 동기화 ───────────────────────────────────────────────
  const sync = useCallback(async () => {
    if (!gasUrl) return { success: false, count: 0 };
    try {
      const res  = await fetch(gasUrl, { method: 'GET', credentials: 'omit', redirect: 'follow' });
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('GAS 응답이 배열이 아닙니다.');

      const normalized = deduplicateSessions(data.map(normalizeSession));
      await sessionStore.clear();
      await sessionStore.bulkUpsert(normalized, []);
      setSessions(normalized);
      prevSessionsRef.current = normalized;
      return { success: true, count: normalized.length };
    } catch (err) {
      console.error('[useSessions] Cloud sync 실패:', err);
      return { success: false, count: 0, error: err.message };
    }
  }, [gasUrl]);

  // ── outbox 수동 flush ─────────────────────────────────────────────────────
  const flush = useCallback(async () => {
    if (!gasUrl) return;
    const result = await flushOutbox(gasUrl);
    setPendingCount(await gasBuffer.pendingCount());
    return result;
  }, [gasUrl]);

  return { sessions, setSessions, isLoaded, pendingCount, sync, flush };
}
