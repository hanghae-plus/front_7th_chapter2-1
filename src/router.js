/**
 * URL 파라미터와 상태를 동기화하는 라우터 유틸리티
 */

/**
 * URL을 업데이트합니다 (history.pushState 사용)
 * @param {string} url - 업데이트할 전체 URL
 */
export const push = (url) => {
  if (typeof window === "undefined") return;
  history.pushState(null, "", url);
};

/**
 * URL 쿼리 파라미터를 업데이트하고 history.pushState로 URL을 변경합니다.
 * @param {Object} params - 업데이트할 파라미터 객체 (key: value 형태, 빈 문자열이나 null이면 삭제)
 * @returns {string} 업데이트된 URL
 */
export const updateParams = (params = {}) => {
  if (typeof window === "undefined") return "";

  const queryParams = new URLSearchParams(window.location.search);

  // 파라미터 업데이트
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      queryParams.delete(key);
    } else {
      queryParams.set(key, value);
    }
  });

  // API 호출용 파라미터는 URL에서 제거
  queryParams.delete("current");
  queryParams.delete("page");

  // URL 구성
  const queryString = queryParams.toString();
  const nextUrl = queryString ? `/?${queryString}` : "/";

  // history.pushState로 URL 업데이트
  push(nextUrl);

  return nextUrl;
};
