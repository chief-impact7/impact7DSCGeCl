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

## Claude → Gemini 전달 사항 (2026-02-19)

### 이번 세션 완료 작업 (Log #3702~3705) — Gemini: git add/commit 해줘

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

Vite build ✓ (1734 modules, 오류 없음)

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