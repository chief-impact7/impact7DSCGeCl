/**
 * ─── 인증 유틸리티 ────────────────────────────────────────────────────────────
 *
 * 현재는 localStorage 기반 임시 구현입니다.
 *
 * TODO: Google / Firebase Auth 연동 시 이 파일만 수정하면 됩니다.
 *
 *   구현 예시 (Firebase Auth):
 *     import { getAuth } from 'firebase/auth';
 *     export const getAuthUser = () => getAuth().currentUser?.displayName ?? getAuth().currentUser?.email ?? '';
 *     export const setAuthUser  = () => {};  // Firebase가 자동 관리
 *
 *   구현 예시 (Google Workspace SSO):
 *     export const getAuthUser = () => window.__googleUser?.getBasicProfile?.()?.getName?.() ?? '';
 */

const STORAGE_KEY = 'authUser';

/**
 * 현재 로그인된 사용자 이름(또는 ID)을 반환합니다.
 * 로그인 정보가 없으면 빈 문자열을 반환합니다.
 *
 * @returns {string}
 */
export function getAuthUser() {
    // 1순위: 외부 인증 시스템이 주입한 전역 값 (Firebase Auth, Google SSO 등)
    if (typeof window !== 'undefined' && window.__authUser) {
        return window.__authUser;
    }
    // 2순위: 개발 / 임시 저장 값
    return localStorage.getItem(STORAGE_KEY) ?? '';
}

/**
 * 개발 환경에서 사용자 이름을 수동 설정합니다.
 * 실제 인증 시스템 연동 후에는 호출할 필요 없습니다.
 *
 * @param {string} name
 */
export function setAuthUser(name) {
    if (name) {
        localStorage.setItem(STORAGE_KEY, name);
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}
