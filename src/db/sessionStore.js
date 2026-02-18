import { openDatabase, STORE } from './database';
import { normalizeSession } from './normalize';

/**
 * sessions ObjectStore에 대한 CRUD 래퍼.
 * 모든 함수는 async/await 기반입니다.
 */
export const sessionStore = {

  /** 모든 세션을 배열로 반환합니다. */
  async getAll() {
    const db = await openDatabase();
    return db.getAll(STORE.SESSIONS);
  },

  /** 단일 세션을 ID로 조회합니다. */
  async getById(id) {
    const db = await openDatabase();
    return db.get(STORE.SESSIONS, id);
  },

  /**
   * 변경된 세션만 감지하여 한 트랜잭션으로 upsert합니다.
   * @param {Session[]} sessions      최신 세션 배열
   * @param {Session[]} prevSessions  직전 세션 배열 (비교 기준)
   * @returns {Promise<number>}       실제 write된 건수
   */
  async bulkUpsert(sessions, prevSessions = []) {
    const db = await openDatabase();
    const prevMap = new Map(prevSessions.map(s => [s.id, s]));

    const changed = sessions.filter(s => {
      const prev = prevMap.get(s.id);
      if (!prev) return true;
      return JSON.stringify(s) !== JSON.stringify(prev);
    });

    if (changed.length === 0) return 0;

    const tx = db.transaction(STORE.SESSIONS, 'readwrite');
    await Promise.all([
      ...changed.map(s => tx.store.put(normalizeSession(s))),
      tx.done,
    ]);
    return changed.length;
  },

  /** 단일 세션 upsert */
  async put(session) {
    const db = await openDatabase();
    return db.put(STORE.SESSIONS, normalizeSession(session));
  },

  /** 세션을 ID로 삭제합니다. */
  async delete(id) {
    const db = await openDatabase();
    return db.delete(STORE.SESSIONS, id);
  },

  /** 모든 세션을 삭제합니다. */
  async clear() {
    const db = await openDatabase();
    return db.clear(STORE.SESSIONS);
  },

  /**
   * 오늘 요일에 해당하는 세션만 조회합니다.
   * @param {string} todayName  예: '월', '화'
   */
  async getTodaySessions(todayName) {
    const db = await openDatabase();
    return db.getAllFromIndex(STORE.SESSIONS, 'by_attendanceDays', todayName);
  },
};
