import { openDatabase, STORE } from './database';

// ─── metaStore ────────────────────────────────────────────────────────────────

/**
 * 필터, 핀 상태 등 소형 설정값 저장소.
 * localStorage.getItem/setItem 과 1:1 교체 가능한 인터페이스.
 */
export const metaStore = {
  async get(key) {
    const db = await openDatabase();
    return db.get(STORE.META, key);
  },
  async set(key, value) {
    const db = await openDatabase();
    return db.put(STORE.META, value, key);
  },
  async delete(key) {
    const db = await openDatabase();
    return db.delete(STORE.META, key);
  },
};

// ─── importHistoryStore ───────────────────────────────────────────────────────

/**
 * importHistory를 META 스토어에 JSON으로 저장합니다.
 */
export const importHistoryStore = {
  async load() {
    return (await metaStore.get('importHistory')) || [];
  },
  async save(history) {
    return metaStore.set('importHistory', history);
  },
};

// ─── filterStore ──────────────────────────────────────────────────────────────

const DEFAULT_FILTERS = { departments: [], grades: [], class: 'All', school: 'All' };

/**
 * 필터 및 핀 상태 저장 헬퍼.
 */
export const filterStore = {
  async load() {
    return (await metaStore.get('impact7_filters')) || DEFAULT_FILTERS;
  },
  async save(filters) {
    return metaStore.set('impact7_filters', filters);
  },
  async clear() {
    return metaStore.set('impact7_filters', DEFAULT_FILTERS);
  },
  async loadPinned() {
    return (await metaStore.get('impact7_pinned')) === true;
  },
  async savePinned(value) {
    return metaStore.set('impact7_pinned', value);
  },
};
