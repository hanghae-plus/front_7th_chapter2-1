import { router } from "../../App.js";

/**
 * URL searchParams 업데이트
 * @param {Object} updates - 업데이트할 파라미터 객체
 * @param {boolean} resetPage - current를 1로 리셋할지 여부 (기본: true)
 * @returns {string} 업데이트된 searchParams 문자열
 */
export function updateSearchParams(updates = {}, resetPage = true) {
  const searchParams = new URLSearchParams(window.location.search);

  // 파라미터 업데이트
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  });

  // 페이지 리셋
  if (resetPage) {
    searchParams.set("current", "1");
  }

  return searchParams.toString();
}

/**
 * URL searchParams로 네비게이션
 * @param {Object} updates - 업데이트할 파라미터 객체
 * @param {boolean} resetPage - current를 1로 리셋할지 여부
 */
export function navigateWithParams(updates = {}, resetPage = true) {
  const params = updateSearchParams(updates, resetPage);
  router.navigateTo(`/?${params}`);
}

/**
 * 특정 경로로 네비게이션
 * @param {string} path - 이동할 경로
 */
export function navigateTo(path) {
  router.navigateTo(path);
}

/**
 * 현재 searchParams에서 특정 키의 값 가져오기
 * @param {string} key - 파라미터 키
 * @param {any} defaultValue - 기본값
 * @returns {string} 파라미터 값
 */
export function getSearchParam(key, defaultValue = "") {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(key) || defaultValue;
}
