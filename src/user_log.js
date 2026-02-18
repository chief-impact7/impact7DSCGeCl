/**
 * user_log.js — 배럴(Barrel) re-export 파일
 *
 * 실제 구현은 아래 모듈로 분리되어 있습니다:
 *   src/db/database.js        — DB 초기화 및 스토어 상수
 *   src/db/normalize.js       — normalizeSession, deduplicateSessions, toArray
 *   src/db/sessionStore.js    — sessionStore CRUD
 *   src/db/metaStore.js       — metaStore, filterStore, importHistoryStore
 *   src/db/gasBuffer.js       — gasBuffer, sendToGAS, flushOutbox
 *   src/db/migrate.js         — migrateFromLocalStorage
 *   src/hooks/useSessions.js  — useSessions 훅
 *   src/hooks/useImportHistory.js — useImportHistory 훅
 *   src/hooks/useFilters.js   — useFilters 훅
 *
 * Dashboard.jsx, App.jsx 등 기존 import 경로를 바꾸지 않아도 됩니다.
 */

// DB 계층
export { openDatabase, DB_NAME, DB_VERSION, STORE } from './db/database';
export { normalizeSession, normalizeChecks, deduplicateSessions, toArray, createBlankSession, parseMemos } from './db/normalize';
export { sessionStore }      from './db/sessionStore';
export { metaStore, filterStore, importHistoryStore } from './db/metaStore';
export { gasBuffer, sendToGAS, flushOutbox }          from './db/gasBuffer';
export { migrateFromLocalStorage }                    from './db/migrate';

// React 훅
export { useSessions }      from './hooks/useSessions';
export { useImportHistory } from './hooks/useImportHistory';
export { useFilters }       from './hooks/useFilters';

// ─── 디버그 유틸 ──────────────────────────────────────────────────────────────
// 브라우저 콘솔에서 직접 호출해 DB 상태를 확인할 수 있습니다.

export { debug } from './db/debug';

/* ─── 변경 이력 ────────────────────────────────────────────────────────────────
[Log #2111] 2024-03-21
작업: React import 방식 수정 및 _getReact 제거를 통한 화이트 스크린 오류 해결 시도. 명시적 가로채기(Explicit Imports) 사용으로 변경. */
/* [Log #2211] 2024-03-21
작업: Dashboard.jsx의 중복된 로컬 스토리지 로직 제거 및 정의되지 않은 setIsLoaded 호출 오류 수정. isSyncing 상태 추가. */
/* [Log #2275] 2024-03-21
작업: 화이트 스크린 오류 최종 해결.
1. src/user_log.js의 React import 방식 정상화 및 _getReact 제거.
2. Dashboard.jsx의 redundant localStorage useEffect 및 정의되지 않은 setIsLoaded 호출 제거.
3. 중복된 root 경로의 user_log.js 삭제(src/user_log.js로 통합).
4. handleCloudSync가 신규 sync 라이브러리를 사용하도록 수정. */
/*
[Log #2276] [2026-02-17 20:05:40]
사용자: localhost 주소가 5173이야?
작업: vite.config.js를 확인하여 기본 포트인 5173이 사용되고 있음을 확인하고 사용자에게 답변함. */
/*
[Log #2277] [2026-02-17 20:07:46]
사용자: @[TerminalName: esbuild, ProcessId: 25372]
작업: 터미널에서 발생한 Vite Internal Server Error를 확인하고 src/user_log.js의 구문 오류(주석 처리 미흡)를 해결하기 위해 파일을 분석 중. */
/* [Log #2397] 2024-03-21
작업: IndexedDB 및 GAS 연동 개선.
1. idb 정적 import로 변경하여 초기 로드 안정성 확보.
2. sync 요청 시 fetch 옵션에 { credentials: 'omit', redirect: 'follow' } 추가.
3. 초기 마이그레이션 실패 시에도 sync를 시도하도록 로직 보완. */
/* [Log #2422] 2026-02-17
작업: 서버 연결 거부 오류 확인. Vite 프로세스 재시작(npm run dev). */
/* [Log #2608] 2026-02-17
작업: Attendance 필터링 버그 수정 (Critical Fix).
1. filterStore.clear() 메서드 수정: delete 대신 기본값({ class: 'All', school: 'All' }) 설정.
2. 필터 초기화 시 class/school 속성 누락으로 인한 전체 목록 필터링 문제 해결.
3. EmptyState 컴포넌트에 filters prop 전달 및 디버그 모드 개선. */
/* [Log #2656] 2026-02-17
작업: Coursework 및 Retention 뷰 학생 정보 표시 개선.
학생 이름 옆에 학교+학년 정보를 작은 회색 글씨로 표시하도록 추가. */
/* [Log #2853] 2026-02-18
작업: 학생 상세 프로필 모달 및 오버레이 기능 구현.
학생 이름/행 클릭 시 상세 정보(이름, 학교/반, 출석 유형, 출석/과제/리텐션 현황, 메모, Pending Tasks)를 보여주는 모달 기능 추가.
Pending Tasks 입력 및 저장 기능 추가 (GAS 동기화 포함).
메인 리스트 및 임포트 스테이징 구역 모두에 적용. */
/* [Log #2918] 2026-02-18
작업: 특강 스케줄 학생 필터링 문제 해결.
기존 정규 스케줄(attendanceDays)만 확인하던 로직에서 특강 스케줄(specialDays)도 함께 확인하도록 필터 강화.
디버그 모드에서 정규/특강 인원수 각각 확인 가능하도록 세분화. */
/* [Log #2939] 2026-02-18
작업: 학생 상세 프로필 뷰를 우측 슬라이드 패널(Side Drawer)로 변경.
중앙 모달 방식에서 우측에서 슬라이드 인 되는 세로형 패널로 UI 개선.
상세 정보 가독성 향상 및 메인 화면과의 동시 작업 편의성 고려. */
/* [Log #2966] 2026-02-18
작업: 스케줄 표시 및 병합 로직 최종 보완.
메인 출석 리스트에서 정규(검정)와 특강(보라) 스케줄을 모두 표시하도록 개선.
데이터 배정 시 기존 체크 상태가 유실되지 않도록 선별적 병합(Merge) 로직 적용.
기존 학생이 수요일 특강으로 배정된 경우 오늘 출석 목록에 정상적으로 나타나도록 해결. */
/* [Log #2999] 2026-02-18
작업: 스케줄 표시 UI 단일 줄 통합 및 컬러 시스템 적용.
정규(검정), 특강(보라), 중복(초록) 컬러를 사용하여 한 줄에 모든 스케줄 표시.
오늘 요일은 더 굵은 테두리로 강조하여 등원 정당성 시각화.
메인 리스트, 임포트 리스트, 상세 프로필 패널 모두 동일한 규칙 적용. */
/* [Log #3162] 2026-02-18
작업: 스케줄 표시 고도화 및 임의요일(Arbitrary Schedule) 기능 추가.
시간 표시(하단 텍스트)를 삭제하여 UI를 간소화.
새로운 컬러 시스템 적용: 정규(초록), 특강(보라), 임의(오렌지), 중복(블랙).
오늘 요일 아이콘 확대 및 테두리 강조로 가독성 향상.
임의요일 일괄 배정 및 개별 편집 기능을 사이드바와 툴바에 통합. */
/* [Log #3218] 2026-02-18
작업: 프로필 모달 크래시(화이트스크린) 수정 및 요일 아이콘 정렬 개선.
ProfileModal에 todayName 변수가 누락되어 발생하던 ReferenceError를 해결.
메인 리스트 및 프로필 모달 내 요일 아이콘들을 가로/세로 중앙 정렬하여 시각적 균형을 맞춤. */
/* [Log #3315] 2026-02-18
작업: 특강 학생 필터링 오류 수정 및 임포트 허브 UI 최적화.
특강(specialDays)이나 임의등원(extraDays)만 있는 학생이 오늘 명단에 나타나지 않던 오류를 해결 (필터링 로직에 string/array 호환성 추가).
임포트 허브(staging)의 스케줄 셀에서는 오늘 날짜 강조(검은 테두리 및 확대)를 제거하여 관리 가독성을 높임.
데이터 정규화 로직에 특강 및 임의등원 필드를 추가하여 데이터 일관성 확보. */
/* [Log #3361] 2026-02-18
작업: 스케줄 필터링 및 요콘 매칭 로직 완전 자동화 (Robust Matching).
특강(specialDays)이나 임의등원(extraDays) 학생이 출석 명단에서 누락되던 문제를 isDayMatch 헬퍼 함수를 도입하여 해결. 정규/특강/임의 등 모든 등원 유형에 대해 일관된 매칭 알고리즘 적용.
임포트 허브(staging)의 모든 영역(테이블 및 프로필 모달)에서 오늘 날짜 강조(검은 테두리)를 비활성화하여 데이터 관리 가독성 개선. */
/* [Log #3415] 2026-02-18
작업: 데이터 통합(Merge) 및 필터 시각화 개선.
스테이징에서 실제 출석부(Attendance)로 데이터를 넘길 때(Commit), 이름과 반 정보를 기반으로 한 병합 로직을 정규화 키(_dedupeKey) 방식으로 교체하여 데이터 유실 및 중복 생성을 원천 차단.
데이터 유입 모든 단계(Cloud Import, Paste, Individual Add)에 정규화 로직을 강제 적용하여 데이터 형식이 깨지는 문제 해결.
오늘 출석 명단 헤더에 '필터링 중' 상태 표시기를 추가하여, 학년/반 필터로 인해 학생이 가려졌을 때 사용자가 즉시 인지하고 해제할 수 있도록 개선. */
/* [Log #3440] 2026-02-18
작업: 화이트스크린(ReferenceError) 긴급 수정.
isDayMatch 헬퍼 함수가 Dashboard 컴포넌트 내부에 정의되어 있어 외부 컴포넌트(ScheduleCell, ProfileModal)에서 참조하지 못하던 문제를 해결.
함수를 파일 최상위 스코프로 이동하여 모든 컴포넌트가 정상적으로 참조할 수 있도록 수정했습니다. */
/* [Log #3535] 2026-02-18 02:24
사용자: Cloud Sync 버튼을 누르면 최근 탭이 자동으로 스테이징에 로드되어야 하는데 안되고 계속 클론하고 있다. 이것부터 해결해달라.
작업: Import Hub의 CLOUD SYNC 버튼에 handleImportCloudSync 함수를 새로 구현. 기존 handleCloudSync는 DB 전체 동기화 후 Attendance로 이동하는 함수였으나, Import Hub 전용 함수는 Cloud 탭 목록을 가져온 뒤 가장 최근(첫번째) 탭의 데이터를 자동으로 Clone하여 스테이징에 즉시 표시. normalizeSession import 누락 수정. */
/* [Log #3601] 2026-02-18
작업: Dashboard.jsx 버그 수정 (8건).
1. handleBulkStatusUpdate / handleBulkHomeworkUpdate / handleBulkMemoUpdate: sendDataToGAS(s) → sendToGAS(GAS_URL, s, s.id) 교체 (IDB outbox 큐 연동).
2. handleDeleteMemo: sendDataToGAS(result) → sendToGAS(GAS_URL, result, result.id) 교체.
3. clearFilters: 직접 localStorage 호출 제거 → clearFiltersFromStore() 단독 사용 (IDB 기반 hook과 일치).
4. Pin 버튼: localStorage.setItem 중복 호출 제거 → setIsFilterPinned(!isFilterPinned) 단독 사용 (toggleFilterPin이 IDB 저장 처리).
5. EmptyState: filters.searchQuery (존재하지 않는 속성) 참조 → searchQuery prop 추가 전달 후 사용.
6. EmptyState onMaster: setViewMode('master') (정의되지 않은 뷰모드) → setViewMode('today') 수정. */
/* [Log #3701] 2026-02-18
작업: Dashboard.jsx 잔재 코드 정리 (3건).
1. sendDataToGAS 함수 정의 삭제 (IDB outbox를 우회하던 구형 GAS 전송 함수).
2. handleCreateSessions 내 sendDataToGAS 호출 → sendToGAS(GAS_URL, ...) 교체 (누락된 4번째 호출처).
3. Dashboard.jsx 내 중복 toArray 정의 삭제 → normalize.js의 toArray import로 통일
   (구 버전은 단순 split만, 신 버전은 배열 내 재귀 split + 특수문자 제거로 더 강건함). */
/* [Log #3678] 2026-02-18
작업: user_log.js 모듈 분할.
단일 ~1000줄 파일 → 목적별 모듈로 분리하여 유지보수성 향상.
  src/db/database.js         — openDatabase, DB 상수
  src/db/normalize.js        — normalizeSession, normalizeChecks, deduplicateSessions, toArray
  src/db/sessionStore.js     — sessionStore CRUD
  src/db/metaStore.js        — metaStore, filterStore, importHistoryStore
  src/db/gasBuffer.js        — gasBuffer, sendToGAS, flushOutbox
  src/db/migrate.js          — migrateFromLocalStorage
  src/hooks/useSessions.js   — useSessions 훅
  src/hooks/useImportHistory.js — useImportHistory 훅
  src/hooks/useFilters.js    — useFilters 훅
  src/user_log.js            — 배럴 re-export (기존 import 경로 호환 유지) */
/* [Log #3702] 2026-02-19
작업: Dashboard.jsx 컴포넌트 분리 (2000줄 → 1545줄).
인라인 서브 컴포넌트 및 공유 상수를 독립 파일로 분리하여 가독성 및 유지보수성 향상.

신규 파일:
  src/constants.js
    — DAYS, COURSEWORK_AREAS, RETENTION_AREAS, isDayMatch (공유 상수 및 요일 매칭 헬퍼)
  src/components/ProfileModal.jsx
    — ProfileModal (학생 상세 슬라이드 패널) + Section, InfoRow, StatusBadge, CheckStatusGrid, CheckIcon (내부 헬퍼)
  src/components/ScheduleCell.jsx
    — ScheduleCell (요일별 정규/특강/임의 컬러 아이콘 셀)
  src/components/ScheduleToolbar.jsx
    — ScheduleToolbar (Import Hub 일괄 스케줄 입력 툴바 + COMMIT 버튼)
  src/components/ui.jsx
    — NavItem, SubNavItem, ImportPanel, FormRow, SectionDivider,
      SidebarInput, MemoIndicator, StatusButtons, EmptyState,
      FilterSelect, DayPicker (공유 UI 프리미티브 named export)

Dashboard.jsx 변경:
  - 상수 블록(DAYS, COURSEWORK_AREAS, RETENTION_AREAS) 삭제 → constants.js import
  - isDayMatch 중복 정의 삭제 → constants.js import
  - 서브 컴포넌트 섹션 전체(lines 1546~2063) 삭제
  - lucide import에서 이동된 컴포넌트가 쓰던 아이콘 제거 (Save, Search, Clock, Zap, Plus)
  - 신규 컴포넌트 5개 import 추가
  - Vite build ✓ (1734 modules, 300KB JS, 오류 없음) */
/* [Log #3703] 2026-02-19
작업: createBlankSession Dashboard.jsx → src/db/normalize.js 이동.
- normalize.js에 createBlankSession() export 추가
- user_log.js 배럴에 createBlankSession re-export 추가
- Dashboard.jsx 인라인 정의 삭제, import에 createBlankSession 추가
- Vite build ✓ (오류 없음) */
/* [Log #3704] 2026-02-19
작업: IDB 스키마 문서화 — src/db/SCHEMA.md 생성.
- 3개 ObjectStore(sessions, outbox, meta) 필드 스키마 전체 문서화
- 인덱스 목록, 재시도 정책, 마이그레이션 이력, 모듈 구조 정리
- meta 스토어 키 목록(importHistory, impact7_filters, impact7_pinned) 및 타입 명세 포함
- 코드 변경 없음 (문서 작성만) */
/* [Log #3705] 2026-02-19
작업: GAS_URL 중앙화 — Dashboard.jsx 하드코딩 → src/constants.js 이동.
- constants.js에 GAS_URL export 추가 (배포 설정 주석 포함)
- Dashboard.jsx 인라인 const GAS_URL 삭제
- Dashboard.jsx import에 GAS_URL 추가
- 코드 내 모든 GAS_URL 참조는 변경 없이 그대로 동작 (13곳)
- Vite build ✓ (오류 없음) */
/* [Log #3706] 2026-02-19
작업: parseMemos 중복 제거 — Dashboard.jsx & MemoModal.jsx → src/db/normalize.js 이동 (최종 스캔 발견).
- Dashboard.jsx와 MemoModal.jsx에 동일한 parseMemos 함수가 중복 정의되어 있었음
- src/db/normalize.js에 parseMemos() export 추가 (JSON 파싱 실패 시 legacy 단일 객체 폴백)
- user_log.js 배럴에 parseMemos re-export 추가 (normalize.js 라인 20)
- Dashboard.jsx: 인라인 정의 삭제 → import에 parseMemos 추가 (user_log 배럴 경유)
- MemoModal.jsx: 인라인 정의 삭제 → import { parseMemos } from '../user_log' 추가
- 잔재 주석 3개 정리 (isDayMatch →, createBlankSession →, 상수 섹션 헤더)
- Vite build ✓ (299.94KB, 중복 제거로 0.06KB 감소) */
