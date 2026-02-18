import { openDatabase, STORE } from './database';

// ─── 설정 ─────────────────────────────────────────────────────────────────────

const GAS_MAX_RETRY    = 5;
const GAS_RETRY_BASE_MS = 1_000;
const GAS_BATCH_SIZE   = 20;

// ─── gasBuffer ────────────────────────────────────────────────────────────────

/**
 * GAS 전송 실패 시 outbox에 항목을 보관하고 재전송을 관리합니다.
 *
 * outbox 스키마:
 *   outboxId  : number (autoIncrement PK)
 *   sessionId : string | null
 *   payload   : object
 *   status    : 'pending' | 'sending' | 'failed' | 'sent'
 *   retries   : number
 *   createdAt : string (ISO)
 *   sentAt    : string | null (ISO)
 */
export const gasBuffer = {

  /** outbox에 전송 항목을 추가합니다. */
  async enqueue(payload, sessionId = null) {
    const db = await openDatabase();
    return db.add(STORE.OUTBOX, {
      sessionId,
      payload,
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
      sentAt: null,
    });
  },

  /** 전송 대기(pending/failed) 항목을 최대 GAS_BATCH_SIZE개 반환합니다. */
  async getPending() {
    const db = await openDatabase();
    const tx = db.transaction(STORE.OUTBOX, 'readonly');
    const idx = tx.store.index('by_status');

    const pending = await idx.getAll('pending', GAS_BATCH_SIZE);
    const failed  = await idx.getAll('failed',  GAS_BATCH_SIZE - pending.length);
    await tx.done;

    return [
      ...pending,
      ...failed.filter(item => item.retries < GAS_MAX_RETRY),
    ];
  },

  /** 전송 완료된 항목들을 outbox에서 삭제합니다. */
  async markSent(outboxIds) {
    if (!outboxIds.length) return;
    const db = await openDatabase();
    const tx = db.transaction(STORE.OUTBOX, 'readwrite');
    await Promise.all([
      ...outboxIds.map(id => tx.store.delete(id)),
      tx.done,
    ]);
  },

  /** 전송 실패 시 재시도 카운트를 올리고 failed 상태로 마킹합니다. */
  async markFailed(outboxId) {
    const db = await openDatabase();
    const item = await db.get(STORE.OUTBOX, outboxId);
    if (!item) return;
    await db.put(STORE.OUTBOX, {
      ...item,
      status:  item.retries + 1 >= GAS_MAX_RETRY ? 'failed' : 'pending',
      retries: item.retries + 1,
    });
  },

  /** outbox에 쌓인 pending 항목 수를 반환합니다. */
  async pendingCount() {
    const db = await openDatabase();
    const tx = db.transaction(STORE.OUTBOX, 'readonly');
    const count = await tx.store.index('by_status').count('pending');
    await tx.done;
    return count;
  },
};

// ─── 내부 유틸 ────────────────────────────────────────────────────────────────

async function _fetchGAS(url, payload) {
  return fetch(url, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let _flushTimer = null;
function scheduleFlush(gasUrl) {
  if (_flushTimer) return;
  _flushTimer = setTimeout(() => {
    _flushTimer = null;
    flushOutbox(gasUrl).catch(err => console.warn('[GAS] flush 스케줄 실패:', err));
  }, 5_000);
}

// ─── sendToGAS ────────────────────────────────────────────────────────────────

/**
 * GAS Web App에 데이터를 전송합니다.
 * 내부적으로 outbox 버퍼를 사용해 실패 시 데이터 유실을 방지합니다.
 *
 * @param {string}  gasUrl
 * @param {object}  data
 * @param {string}  [sessionId]
 * @returns {Promise<boolean>}
 */
export async function sendToGAS(gasUrl, data, sessionId = null) {
  const payload = {
    date:      data.date || new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    ...data,
  };

  const outboxId = await gasBuffer.enqueue(payload, sessionId);

  try {
    await _fetchGAS(gasUrl, payload);
    await gasBuffer.markSent([outboxId]);
    return true;
  } catch (err) {
    console.warn('[GAS] 전송 실패, outbox에 보관:', err.message);
    await gasBuffer.markFailed(outboxId);
    scheduleFlush(gasUrl);
    return false;
  }
}

// ─── flushOutbox ──────────────────────────────────────────────────────────────

/**
 * outbox의 pending/failed 항목을 일괄 재전송합니다.
 * 탭 포커스 복귀 시, 또는 타이머 기반으로 호출합니다.
 *
 * @param {string} gasUrl
 * @returns {Promise<{success: number, fail: number}>}
 */
export async function flushOutbox(gasUrl) {
  const items = await gasBuffer.getPending();
  if (!items.length) return { success: 0, fail: 0 };

  let success = 0, fail = 0;

  for (const item of items) {
    if (item.retries > 0) {
      await _sleep(GAS_RETRY_BASE_MS * 2 ** (item.retries - 1));
    }
    try {
      await _fetchGAS(gasUrl, item.payload);
      await gasBuffer.markSent([item.outboxId]);
      success++;
    } catch {
      await gasBuffer.markFailed(item.outboxId);
      fail++;
    }
  }

  if (success > 0) {
    console.info(`[GAS] flush 완료: ${success}건 전송, ${fail}건 실패`);
  }

  return { success, fail };
}
