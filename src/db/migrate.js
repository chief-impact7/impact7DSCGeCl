import { metaStore, filterStore, importHistoryStore } from './metaStore';
import { sessionStore } from './sessionStore';
import { normalizeSession, deduplicateSessions } from './normalize';

/**
 * localStorage에 남은 legacy 데이터를 IndexedDB로 일회성 마이그레이션합니다.
 * App.jsx 마운트 시점에 한 번만 호출하면 됩니다.
 *
 * @returns {Promise<{migrated: boolean, sessionCount: number}>}
 */
export async function migrateFromLocalStorage() {
  const MIGRATION_KEY = 'impact7_migrated_v2';

  if ((await metaStore.get(MIGRATION_KEY)) === true) {
    return { migrated: false, sessionCount: 0 };
  }

  let sessionCount = 0;

  try {
    // sessions
    const rawSessions = localStorage.getItem('impact7_sessions');
    if (rawSessions) {
      const parsed = JSON.parse(rawSessions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = deduplicateSessions(parsed.map(normalizeSession));
        await sessionStore.bulkUpsert(normalized, []);
        sessionCount = normalized.length;
        localStorage.removeItem('impact7_sessions');
        console.info(`[migration] sessions ${sessionCount}건 이전 완료`);
      }
    }

    // importHistory
    const rawHistory = localStorage.getItem('impact7_history');
    if (rawHistory) {
      const parsed = JSON.parse(rawHistory);
      if (Array.isArray(parsed)) {
        await importHistoryStore.save(parsed);
        localStorage.removeItem('impact7_history');
        console.info('[migration] importHistory 이전 완료');
      }
    }

    // filters
    const rawFilters = localStorage.getItem('impact7_filters');
    if (rawFilters) {
      await filterStore.save(JSON.parse(rawFilters));
      localStorage.removeItem('impact7_filters');
    }

    const rawPinned = localStorage.getItem('impact7_pinned');
    if (rawPinned !== null) {
      await filterStore.savePinned(rawPinned === 'true');
      localStorage.removeItem('impact7_pinned');
    }

    await metaStore.set(MIGRATION_KEY, true);
    return { migrated: true, sessionCount };

  } catch (err) {
    console.error('[migration] 실패:', err);
    return { migrated: false, sessionCount: 0, error: err.message };
  }
}
