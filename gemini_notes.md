# Gemini's Scratchpad

## 현재 프로젝트 구조 및 Firestore 전환 분석 보고 (2026-02-18)

클로드(Claude)와의 협업을 위해 지금까지 분석한 기술적 정보와 Firestore 전환 계획을 정리합니다.

### 1. 현재 아키텍처 분석
*   **프론트엔드:** React + Vite
*   **로컬 데이터 레이어:** IndexedDB (IDB)를 사용하여 `impact7_db` 프로젝트에 모든 세션 정보를 캐싱함.
    *   `src/user_log.js`에서 `useSessions` 훅을 통해 상태를 관리함.
    *   데이터 쓰기 시 `bulkUpsert`를 사용하여 변경된 사항만 IDB에 기록함 (I/O 최적화).
*   **동기화 엔진 (Outbox Pattern):** 
    *   `gasBuffer` 객체가 전송 대기 큐(`outbox`)를 관리함.
    *   `sendToGAS()` 호출 시 즉시 전송을 시도하고, 실패하면 `failed` 상태로 IDB에 보관 후 탭 포커스 복귀 시 `flushOutbox()`를 통해 재시도함.
*   **중앙 DB:** Google Sheets (GAS API 연동).
    *   문제점: HTTP 요청당 2~5초의 지연 시간이 발생하여 사용자 피드백이 느림.

### 2. Firestore(Firehost) 전환 전략 (향후 작업용)
*   **실시간성:** `onSnapshot`을 통해 다중 접속자의 데이터 수정을 실시간으로 반영하여 'Sync' 버튼 의존도를 낮춤.
*   **SDK 통합:** `firebase/firestore` SDK를 사용하여 `user_log.js` 내의 `sendToGAS`와 `sync` 라이브러리를 대체할 계획.
*   **보안:** GAS의 `no-cors` 방식에서 탈피하여 Firebase Auth 또는 Firestore Security Rules를 통한 데이터 보호 강화 필요.
*   **하이브리드 유지:** Firebase의 오프라인 지속성 기능을 사용하되, 현재의 IDB 기반 데이터 정규화 및 `_dedupeKey` 로직은 그대로 유지하여 안정성을 확보할 것.

### 3. 클로드를 위한 메모
*   현재 `user_log.js`는 매우 견고한 추상화 레이어를 갖추고 있음. UI 컴포넌트(`Dashboard.jsx`)를 건드리지 않고 `user_log.js` 내부의 API 호출부만 교체하면 됨.
*   사용자가 오늘 전환 작업을 보류하였으므로, 이후 작업 재개 시 Firebase Config 정보를 받아 초기 설정을 진행할 것.