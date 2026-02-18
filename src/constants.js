// ─── 공유 상수 및 유틸 ────────────────────────────────────────────────────────
//
// Dashboard.jsx 에서 분리된 공유 상수 / 헬퍼.
// ScheduleCell, ScheduleToolbar, DayPicker, ProfileModal 등 여러 컴포넌트가
// import 하여 사용합니다.

// ─── GAS (Google Apps Script) ─────────────────────────────────────────────────

/**
 * GAS Web App URL.
 * 배포 URL이 변경되면 이 파일 한 곳만 수정하면 됩니다.
 *
 * GAS 배포 설정:
 *   - 실행 계정: Me
 *   - 액세스 권한: Anyone (익명 포함) — CORS 허용을 위해 필수
 */
export const GAS_URL = "https://script.google.com/macros/s/AKfycbzj9U17izH6L6pjvIgapyxHfFiLQLB9WqbQ0umTVa972ZWbSYXFWiHiBknLpqrP924o/exec";

// ─── 요일 ──────────────────────────────────────────────────────────────────────

/** 요일 배열 (월~일) */
export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

/** Coursework 영역 정의 */
export const COURSEWORK_AREAS = [
    { key: 'reading',   label: 'R' },
    { key: 'grammar',   label: 'G' },
    { key: 'practice',  label: 'P' },
    { key: 'listening', label: 'L' },
    { key: 'etc',       label: 'E' },
];

/** Retention 영역 정의 */
export const RETENTION_AREAS = [
    { key: 'vocab',     label: 'V' },
    { key: 'idioms',    label: 'I' },
    { key: 'verbs',     label: '3' },
    { key: 'reading',   label: 'R' },
    { key: 'grammar',   label: 'G' },
    { key: 'practice',  label: 'P' },
    { key: 'listening', label: 'L' },
    { key: 'isc',       label: 'W' },
    { key: 'etc',       label: 'E' },
];

/**
 * 요일 매칭 헬퍼
 * 배열·문자열·쉼표/공백 구분 문자열 모두 대응합니다.
 *
 * @param {string|string[]} daysBase  - 등원 요일 값 (attendanceDays, specialDays, extraDays 등)
 * @param {string}           targetDay - 비교할 요일 (예: '월')
 * @returns {boolean}
 */
export const isDayMatch = (daysBase, targetDay) => {
    if (!daysBase) return false;
    const arr = Array.isArray(daysBase)
        ? daysBase
        : (typeof daysBase === 'string' ? daysBase.split(/[,|/\s]+/) : []);
    return arr.some(d => d.trim().includes(targetDay));
};
