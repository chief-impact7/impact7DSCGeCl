import { openDatabase, STORE } from './database';

/**
 * 브라우저 콘솔에서 직접 호출해 DB 상태를 확인할 수 있는 유틸.
 * 프로덕션 빌드에서는 tree-shaking으로 제거됩니다.
 */
export const debug = {
  /** 전체 세션 수 반환 */
  async countSessions() {
    const db = await openDatabase();
    return db.count(STORE.SESSIONS);
  },

  /** outbox 전체 내용 반환 */
  async dumpOutbox() {
    const db = await openDatabase();
    return db.getAll(STORE.OUTBOX);
  },

  /** IndexedDB 전체 초기화 (주의!) */
  async nukeAll() {
    const { deleteDB } = await import('idb');
    await deleteDB('impact7_db');
    console.warn('[debug] IndexedDB 삭제 완료. 페이지를 새로고침하세요.');
  },
};
