# IndexedDB 스키마 문서

**DB 이름**: `impact7_db`
**현재 버전**: `2`
**라이브러리**: [`idb`](https://github.com/jakearchibald/idb) (Promise 래퍼)

---

## ObjectStore 목록

| Store 이름 | keyPath | autoIncrement | 버전 도입 |
|------------|---------|---------------|-----------|
| `sessions` | `id`    | ✗             | v1        |
| `outbox`   | `outboxId` | ✓          | v1        |
| `meta`     | (외부 키) | ✗           | v2        |

---

## `sessions` 스토어

학생별 일일 체크리스트 세션 레코드.

### 인덱스

| 인덱스 이름         | 필드            | multiEntry |
|---------------------|-----------------|------------|
| `by_class`          | `classes`       | ✓          |
| `by_department`     | `department`    | ✗          |
| `by_attendanceDays` | `attendanceDays`| ✓          |
| `by_status`         | `status`        | ✗          |

### 필드 스키마

```
{
  // ── 식별자 ──────────────────────────────────────────────
  id          : string   // PK — Date.now() + random (createBlankSession 생성)
  studentId   : string   // 'st_' + random (UI 표시용 학번)
  _dedupeKey  : string   // `${name}_${classes[0]}` — 중복 제거 기준 (normalizeSession 자동 부여)

  // ── 학생 기본 정보 ──────────────────────────────────────
  name         : string   // 학생 이름
  department   : string   // 소속 (예: '2단지', '10단지', '기타')
  schoolName   : string   // 학교명 (예: '대치중')
  grade        : string   // 학년 (예: '2')
  classes      : string[] // 수강 반 목록 (예: ['TEPS-A'])
  parentPhones : string[] // 학부모 연락처
  studentPhones: string[] // 학생 연락처

  // ── 스케줄 ──────────────────────────────────────────────
  attendanceDays : string[] // 정규 등원 요일 (예: ['월', '수', '금'])
  attendanceTime : string   // 정규 등원 시간 (예: '16:00')
  specialDays    : string[] // 특강 등원 요일
  specialTime    : string   // 특강 등원 시간
  extraDays      : string[] // 임의 등원 요일 (1회성)

  // ── 출석 상태 ───────────────────────────────────────────
  status         : 'waiting' | 'attendance' | 'late' | 'absent'
  backlogCount   : number   // 밀린 숙제 횟수

  // ── 체크 데이터 ─────────────────────────────────────────
  checks: {
    basic: {
      voca  : 'none' | 'check' | 'cross'
      idiom : 'none' | 'check' | 'cross'
      step3 : 'none' | 'check' | 'cross'
      isc   : 'none' | 'check' | 'cross'
    }
    homework: {
      reading  : 'none' | 'check' | 'cross'
      grammar  : 'none' | 'check' | 'cross'
      practice : 'none' | 'check' | 'cross'
      listening: 'none' | 'check' | 'cross'
      etc      : 'none' | 'check' | 'cross'
    }
    review: {
      reading  : 'none' | 'check' | 'cross'
      grammar  : 'none' | 'check' | 'cross'
      practice : 'none' | 'check' | 'cross'
      listening: 'none' | 'check' | 'cross'
    }
    nextHomework: {
      reading  : string  // 다음 숙제 범위
      grammar  : string
      practice : string
      listening: string
      extra    : string
    }
    memos: {
      toDesk    : string  // 학생→선생 메모
      fromDesk  : string  // 선생→학생 메모
      toParent  : string  // 학부모 전달 메모
      pendingTasks?: string  // 미완료 과제 (ProfileModal에서 입력)
    }
    homeworkResult   : 'none' | 'check' | 'cross'
    summaryConfirmed : boolean
  }

  // ── 메타 ────────────────────────────────────────────────
  lastEditedBy : string   // 마지막 편집자 (현재 'Teacher Kim' 고정)
  updatedAt?   : string   // ISO 날짜 문자열 (deduplicateSessions 비교 기준)
}
```

---

## `outbox` 스토어

GAS 전송 실패 시 재전송 대기열 (outbox 패턴).

### 인덱스

| 인덱스 이름   | 필드        | multiEntry |
|---------------|-------------|------------|
| `by_status`   | `status`    | ✗          |
| `by_createdAt`| `createdAt` | ✗          |

### 필드 스키마

```
{
  outboxId  : number   // PK (autoIncrement)
  sessionId : string | null  // 연관 세션 ID
  payload   : object   // GAS로 전송할 데이터 (type, students, date, timestamp 등)
  status    : 'pending' | 'sending' | 'failed' | 'sent'
  retries   : number   // 재시도 횟수 (최대 GAS_MAX_RETRY = 5)
  createdAt : string   // ISO 날짜 문자열
  sentAt    : string | null  // 전송 완료 시각
}
```

**재시도 정책**: 실패 시 지수 백오프 (`1000ms × 2^(retries-1)`), 최대 5회.
전송 성공 시 레코드를 삭제합니다 (`markSent` → `delete`).

---

## `meta` 스토어

소형 설정값 key-value 저장소. 외부 키 사용 (keyPath 없음).

### 저장되는 키 목록

| 키                | 값 타입          | 관리 모듈          | 설명 |
|-------------------|------------------|--------------------|------|
| `importHistory`   | `ImportTab[]`    | `importHistoryStore` | Import Hub 탭 히스토리 |
| `impact7_filters` | `FilterState`    | `filterStore`      | 필터 상태 (학년/반/학교) |
| `impact7_pinned`  | `boolean`        | `filterStore`      | 필터 고정 여부 |

#### `FilterState` 타입

```
{
  departments : string[]  // 선택된 소속 목록
  grades      : string[]  // 선택된 학년 목록
  class       : string    // 선택된 반 ('All' 또는 반 이름)
  school      : string    // 선택된 학교 ('All' 또는 학교명)
}
```

#### `ImportTab` 타입

```
{
  id        : string   // 탭 ID
  label     : string   // 탭 표시 이름
  students  : Session[] // 스테이징된 학생 목록
  createdAt : string   // ISO 날짜 문자열
}
```

---

## 마이그레이션 이력

| 버전 | 변경 내용 |
|------|-----------|
| v1   | `sessions` 스토어 생성 (인덱스 4개), `outbox` 스토어 생성 (인덱스 2개) |
| v2   | `meta` 스토어 추가 (필터/핀/임포트 히스토리 localStorage 대체) |

---

## 모듈 구조

```
src/db/
├── database.js       — openDatabase(), DB_NAME, DB_VERSION, STORE 상수
├── normalize.js      — normalizeSession(), normalizeChecks(), createBlankSession(),
│                       deduplicateSessions(), toArray()
├── sessionStore.js   — sessionStore (CRUD: getAll, put, bulkUpsert, delete, clear)
├── metaStore.js      — metaStore (get/set/delete), importHistoryStore, filterStore
├── gasBuffer.js      — gasBuffer (outbox 관리), sendToGAS(), flushOutbox()
├── migrate.js        — migrateFromLocalStorage() (localStorage → IDB 1회성)
├── debug.js          — 브라우저 콘솔 디버그 유틸
└── SCHEMA.md         — 이 파일
```

`src/user_log.js`는 위 모듈 전체의 배럴 re-export 파일입니다.
기존 `import { ... } from './user_log'` 경로는 변경 없이 동작합니다.
