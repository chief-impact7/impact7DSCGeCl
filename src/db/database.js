import { openDB } from 'idb';

// ─── 상수 ─────────────────────────────────────────────────────────────────────

export const DB_NAME = 'impact7_db';
export const DB_VERSION = 2;

export const STORE = {
  SESSIONS: 'sessions',
  OUTBOX:   'outbox',
  META:     'meta',
};

// ─── DB 초기화 ────────────────────────────────────────────────────────────────

/**
 * IndexedDB 인스턴스를 열고 필요한 ObjectStore를 생성/마이그레이션합니다.
 * @returns {Promise<IDBDatabase>}
 */
export async function openDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion) {
      // v1: sessions, outbox
      if (oldVersion < 1) {
        if (!database.objectStoreNames.contains(STORE.SESSIONS)) {
          const sessStore = database.createObjectStore(STORE.SESSIONS, { keyPath: 'id' });
          sessStore.createIndex('by_class',          'classes',        { multiEntry: true });
          sessStore.createIndex('by_department',     'department');
          sessStore.createIndex('by_attendanceDays', 'attendanceDays', { multiEntry: true });
          sessStore.createIndex('by_status',         'status');
        }
        if (!database.objectStoreNames.contains(STORE.OUTBOX)) {
          const outboxStore = database.createObjectStore(STORE.OUTBOX, {
            keyPath: 'outboxId', autoIncrement: true,
          });
          outboxStore.createIndex('by_status',    'status');
          outboxStore.createIndex('by_createdAt', 'createdAt');
        }
      }
      // v2: meta
      if (oldVersion < 2) {
        if (!database.objectStoreNames.contains(STORE.META)) {
          database.createObjectStore(STORE.META);
        }
      }
    },
    blocked()  { console.warn('[idb] DB upgrade blocked. Please close other tabs.'); },
    blocking() { console.warn('[idb] This tab is blocking a DB upgrade.'); },
  });
}
