# Claude Notes — impact7DSC (impact7DSCbyAnCl0218)

## 세션 시작: 2026-02-18

### 워크스페이스 정보
- **현재 작업 디렉토리**: `C:\Coding\impact7DSCbyAnCl0218`
- **이전 참조 프로젝트**: `C:\Coding\impact7DSC - Copy\.claude\worktrees\thirsty-lumiere`
- **협업 파트너**: Gemini (Anti-Gravity) — git, gemini.md, gemini_notes.md 담당
- **Git 제한**: Claude는 git 명령어 절대 실행 금지

---

## 현재 프로젝트 상태 요약 (Log #3678 기준)

### 아키텍처 (최신 — 모듈 분할 완료)
- `src/user_log.js` — **배럴 re-export** (기존 import 경로 호환 유지)
- `src/db/database.js` — openDatabase, DB 상수
- `src/db/normalize.js` — normalizeSession, normalizeChecks, deduplicateSessions, toArray
- `src/db/sessionStore.js` — sessionStore CRUD
- `src/db/metaStore.js` — metaStore, filterStore, importHistoryStore
- `src/db/gasBuffer.js` — gasBuffer, sendToGAS, flushOutbox (outbox 큐 기반 GAS 전송)
- `src/db/migrate.js` — migrateFromLocalStorage (localStorage → IDB 일회성 마이그레이션)
- `src/db/debug.js` — 브라우저 콘솔 디버그 유틸
- `src/hooks/useSessions.js` — useSessions 훅
- `src/hooks/useImportHistory.js` — useImportHistory 훅
- `src/hooks/useFilters.js` — useFilters 훅
- `src/App.jsx` — 마이그레이션 트리거, Dashboard 렌더
- `src/Dashboard.jsx` — 메인 컴포넌트 (user_log 훅 연동)
- `src/components/BulkActionBar.jsx` — 하단 일괄처리 플로팅 바
- `src/components/CourseCheckGroup.jsx` — 과목별 체크 버튼 그룹
- `src/components/MemoModal.jsx` — 메모 모달

### 구현된 기능 (최신)
- Attendance / Coursework / Retention 뷰 분리
- Import Hub (스테이징, Excel 붙여넣기, 개별 추가, 정보수정, 히스토리)
- 스케줄 시스템: 정규(초록), 특강(보라), 임의등원(오렌지), 중복(블랙)
- `isDayMatch` 헬퍼로 string/array 모두 대응하는 필터링
- 학생 프로필 우측 슬라이드 패널 (ProfileModal → Side Drawer)
- Cloud Sync: 가장 최근 탭 자동 스테이징 로드 (`handleImportCloudSync`)
- IDB outbox 버퍼 기반 GAS 재전송 (탭 포커스 복귀 시 flush)

### 컬러 시스템
| 상태 | 색상 |
|------|------|
| 출석 / 완료 | #84994F |
| 지각 / 부실 | #FCB53B |
| 결석 / 안함 | #B45253 |
| 취소 / 초기화 | #FFE797 |

### GAS URL
`https://script.google.com/macros/s/AKfycbzj9U17izH6L6pjvIgapyxHfFiLQLB9WqbQ0umTVa972ZWbSYXFWiHiBknLpqrP924o/exec`

---

## 완료된 작업 (이번 세션)

### Dashboard.jsx 버그 수정 (Log #3601)
- handleBulkStatusUpdate / Homework / Memo: sendDataToGAS → sendToGAS(GAS_URL, s, s.id)
- handleDeleteMemo: 동일하게 sendToGAS로 교체
- clearFilters: localStorage 직접 호출 제거 → clearFiltersFromStore() 위임
- Pin 버튼: localStorage.setItem 중복 호출 제거
- EmptyState: filters.searchQuery → searchQuery prop 분리
- EmptyState onMaster: setViewMode('master') → setViewMode('today')

### user_log.js 모듈 분할 (Log #3678)
src/db/ 신설:
- database.js   — openDatabase, DB 상수
- normalize.js  — normalizeSession, normalizeChecks, deduplicateSessions, toArray
- sessionStore.js — sessionStore CRUD
- metaStore.js  — metaStore, filterStore, importHistoryStore
- gasBuffer.js  — gasBuffer, sendToGAS, flushOutbox
- migrate.js    — migrateFromLocalStorage
- debug.js      — debug 유틸

src/hooks/ 신설:
- useSessions.js
- useImportHistory.js
- useFilters.js

src/user_log.js → 배럴 re-export (기존 import 경로 호환 유지)

### import 검증 완료
Dashboard.jsx 6개 심볼 + App.jsx 1개 심볼 모두 배럴에서 정상 export 확인

---

## 협업 프로토콜 (Claude ↔ Gemini)

- **Claude 담당**: 코드 작성/수정, claude_notes.md 관리
- **Gemini 담당**: git 커밋, gemini.md, gemini_notes.md 관리
- **세션 시작 시 Claude 필수 행동**: `gemini_notes.md` 먼저 읽기
- **Claude → Gemini 전달 사항**: 이 파일(`claude_notes.md`) 하단에 기록
- **Git 제한**: Claude는 git 명령어 절대 실행 금지

---

## Claude → Gemini 전달 사항 (2026-02-19 세션 재개 — Log #3727~3730) ← 최신

> **Gemini에게**: 아래 내용은 오늘 세션 재개 후 새로 완료된 작업입니다. git add/commit 부탁드립니다.

---

### 수정된 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `src/components/ProfileModal.jsx` | 전면 개편 (신규 기능 다수) |
| `src/Dashboard.jsx` | 레이아웃 구조 수정 + 신규 기능 |
| `src/auth.js` | **신규 생성** (인증 유틸) |
| `user_log.js` | 로그 추가 |

---

### Log #3727~3729 — ProfileModal 전면 개편

#### 제거된 항목
- 기본정보 섹션 전체 (소속, 학번, 스케줄 — 헤더에 이미 표시됨)

#### 변경된 항목

**출석 현황**
- 한 줄 표시: 출석(#84994F), 지각(#FCB53B), 결석(#B45253) 컬러 버튼
- 상태 없으면 "등원전" 표시
- 클릭 비활성 (표시 전용)

**Coursework / Retention 현황표**
- 1차 / 2차 분리 표시 (이전의 "최종 1컬럼" 방식 → 되돌림)
- `StatusDots` 컴포넌트 신설: `o`=초록, `triangle`=노랑, `x`=빨강, null=회색
- 버튼 크기 `w-4 h-4` (기존보다 작게)
- **Next Coursework**: 1차 줄 우측에 "Next" 텍스트, 2차 줄 우측에 5개 버튼 (입력됨=초록, 없음=회색), `ml-10` 간격

**밀린 과업 섹션 (완전 신규)**
- 데이터 구조: `student.checks.memos.taskList[]` (id, date, time, reason, author, status, resolvedBy, resolvedAt)
- 하위 호환: 구 `resolved:boolean` → `status:'done'|'pending'` 자동 정규화
- 카드 UI: done=초록배경, incomplete=빨간배경, pending=흰배경
- 버튼: **완료**(토글, 초록) / **미완료**(토글, 빨강) / **재연기**(검정)
- 재연기 클릭 → 과업추가 폼으로 스크롤, 이유 자동 채움, 날짜/시간만 입력
- 완료 처리 시 `resolvedBy`에 로그인 사용자 자동 기록

**과업 추가 폼 신설**
- 날짜, 시간, 이유(필수), 작성자 입력
- 재연기 모드: 이유 읽기전용, 날짜/시간만 수정 가능

---

### Log #3729 — Dashboard.jsx 레이아웃 구조 수정

#### 날짜 네비게이션
- 기존: `today` 뷰에서만 표시
- 변경: `today`, `coursework`, `retention` 뷰 모두에서 표시

#### 필터바 고정
```jsx
<div className="shrink-0 px-6 py-3 border-b border-border bg-white ...">
  {/* 검색/필터 — 스크롤 영역 밖 */}
</div>
<div className="flex-1 overflow-auto px-6 pb-6">
  {/* 테이블만 스크롤 */}
</div>
```

#### 테이블 헤더(thead) sticky 고정
- `<thead>`에 sticky 적용 시 z-index 충돌 발생 → 각 `<th>`에 직접 적용
- `<th className="sticky top-0 bg-zinc-50 border-b border-border z-30 ...">`
- 테이블 래퍼: `overflow-clip` 사용 (`overflow-hidden` 사용 시 sticky 깨짐)

#### 과업 날짜 → 등원예정생 연동
```js
const selectedDateStr = selectedDate.toLocaleDateString('sv-SE');
const hasTaskToday = (s.checks?.memos?.taskList || []).some(
    t => t.status !== 'done' && !t.resolved && t.date === selectedDateStr
);
if (['today', 'coursework', 'retention'].includes(viewMode)) {
    return (isRegToday || isSpecToday || isExtraToday || hasTaskToday);
}
// useMemo 의존성에 selectedDate 추가
```
- 미완료 과업의 날짜가 선택된 날짜와 일치하면 해당 학생을 목록에 포함

---

### Log #3730 — src/auth.js 신규 생성

**목적**: 사용자 이름 수동 입력 모달 제거 → 로그인 ID 자동 주입 구조 준비

**파일**: `src/auth.js`
```js
export function getAuthUser() {
    // 1순위: window.__authUser (Firebase Auth / Google SSO 연동 시 여기서 주입)
    if (typeof window !== 'undefined' && window.__authUser) return window.__authUser;
    // 2순위: localStorage 'authUser' (개발/임시용)
    return localStorage.getItem('authUser') ?? '';
}
export function setAuthUser(name) { ... }
```

**Dashboard.jsx 변경**
- `showUserPrompt`, `userInputTemp` 상태 제거
- 헤더의 사용자 아바타 버튼 제거
- 이름 설정 모달 제거
- `currentUser` → `useState(() => getAuthUser())` 로 초기화 (내부에서만 사용)

**Firebase Auth 연동 시 할 일**
`src/auth.js`의 `getAuthUser()` 한 줄만 교체하면 전체 앱에 반영됨:
```js
// Firebase Auth 연동 예시
import { getAuth } from 'firebase/auth';
export const getAuthUser = () => getAuth().currentUser?.displayName ?? getAuth().currentUser?.email ?? '';
```

---

### CSS 이슈 메모 (Gemini 참고용)

| 문제 | 원인 | 해결 |
|------|------|------|
| sticky thead 안 먹힘 | `overflow-x-auto` 래퍼가 새 스크롤 컨텍스트 생성 | 외부 컨테이너를 `overflow-auto`로 통합 |
| tbody가 thead 위로 올라옴 | `<thead>`에 z-index 적용 불충분 | 각 `<th>`에 `z-30` 직접 적용 |
| sticky + overflow-hidden 충돌 | `overflow-hidden`은 sticky 기준점 차단 | `overflow-clip`으로 교체 (스크롤 컨텍스트 미생성) |

---

## Claude → Gemini 전달 사항 (2026-02-19 이전 세션 — Log #3702~3706)

#### Log #3702 — Dashboard.jsx 컴포넌트 분리
Dashboard.jsx 2000줄 → 1510줄로 감소. 신규 파일 5개 생성:

| 파일 | 내용 |
|------|------|
| `src/constants.js` | GAS_URL, DAYS, COURSEWORK_AREAS, RETENTION_AREAS, isDayMatch |
| `src/components/ProfileModal.jsx` | ProfileModal + Section, InfoRow, StatusBadge, CheckStatusGrid, CheckIcon |
| `src/components/ScheduleCell.jsx` | ScheduleCell (요일별 컬러 아이콘) |
| `src/components/ScheduleToolbar.jsx` | ScheduleToolbar (Import Hub 일괄 입력 툴바) |
| `src/components/ui.jsx` | NavItem, SubNavItem, ImportPanel, FormRow, SectionDivider, SidebarInput, MemoIndicator, StatusButtons, EmptyState, FilterSelect, DayPicker |

#### Log #3703 — createBlankSession 이동
- `Dashboard.jsx` 인라인 → `src/db/normalize.js` export 함수로 이동
- `user_log.js` 배럴에 `createBlankSession` re-export 추가

#### Log #3704 — IDB 스키마 문서화
- `src/db/SCHEMA.md` 신규 생성 (3개 ObjectStore 전체 필드/인덱스 명세)

#### Log #3705 — GAS_URL 중앙화
- `Dashboard.jsx` 하드코딩 → `src/constants.js` 이동
- 이제 GAS URL 변경 시 `constants.js` 한 곳만 수정하면 됨

#### Log #3706 — parseMemos 중복 제거 (최종 스캔 발견)
- `Dashboard.jsx`와 `MemoModal.jsx`에 동일한 `parseMemos` 함수가 중복 정의되어 있었음
- `src/db/normalize.js`에 `parseMemos()` export 추가
- `user_log.js` 배럴에 `parseMemos` re-export 추가
- `Dashboard.jsx`: 인라인 정의 삭제 → `import`에 `parseMemos` 추가
- `MemoModal.jsx`: 인라인 정의 삭제 → `import { parseMemos } from '../user_log'` 추가
- 잔재 주석 3개 정리 (`isDayMatch →`, `createBlankSession →`, 상수 섹션 헤더)

Vite build ✓ (1734 modules, 299.94KB, 오류 없음)

---

## Claude → Gemini 전달 사항 (2026-02-18)

### 모듈 분할 완료 알림
- `user_log.js`는 현재 **배럴 re-export** 파일로 전환됨
- 실제 로직은 `src/db/*.js`와 `src/hooks/*.js`로 분산됨
- 기존 `import { ... } from './user_log'` 경로는 변경 없이 그대로 동작함
- Gemini가 `src/user_log.js`를 직접 수정할 일이 생기면 실제 구현 파일 위치 확인 필요

### Firestore 전환 시 Claude 권장 접근 방식
- **수정 대상**: `src/db/gasBuffer.js` (sendToGAS, flushOutbox 교체), `src/hooks/useSessions.js` (sync 로직 교체)
- **유지 대상**: `src/db/normalize.js`의 `_dedupeKey` 기반 정규화 로직 (Firestore 전환 후에도 그대로 유지)
- **Dashboard.jsx는 건드릴 필요 없음** — Gemini 분석과 동일한 결론
- `src/db/` 하위에 `firestore.js` 모듈 신설 후 `gasBuffer.js`/`sessionStore.js` 인터페이스 유지하며 내부 구현만 교체하는 방식 권장
- Firebase Auth / Security Rules 설계는 Gemini와 사전 협의 필요 (Claude는 설계 제안 가능, Gemini가 Firebase 콘솔 설정 담당 권장)

### 현재 GAS URL
`https://script.google.com/macros/s/AKfycbzj9U17izH6L6pjvIgapyxHfFiLQLB9WqbQ0umTVa972ZWbSYXFWiHiBknLpqrP924o/exec`

---

## 터미널 / 디버그 로그
(없음)

---

## 로직 메모 / 시도 기록
(없음)