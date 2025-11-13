import { stringifyQuery } from "./queryParser";

/**
 * 프로그래밍 방식으로 페이지 이동
 * @param {string} path - 이동할 경로 (예: "/", "/product/123")
 * @param {Object} query - 쿼리 파라미터 객체 (예: { search: "신발" })
 */
export const navigateTo = (path, query = {}) => {
  // 0. BASE_URL 추가 (production에서는 /front_7th_chapter2-1/)
  const basePath = import.meta.env.BASE_URL || "/";
  const pathWithBase = basePath === "/" ? path : basePath.slice(0, -1) + path;

  // 1. stringifyQuery(query)로 쿼리 객체를 문자열로 변환
  const queryString = stringifyQuery(query);

  // 2. 쿼리 문자열이 있으면 path에 "?" 붙여서 합치기
  const fullPath = queryString ? `${pathWithBase}?${queryString}` : pathWithBase;

  // 3. history.pushState({}, "", fullPath)
  //    - 새로고침 없이 URL 변경
  //    - 브라우저 히스토리에 추가
  history.pushState({}, "", fullPath);

  // 4. popstate 이벤트 발생
  //    - historyHandler가 감지하여 renderCurrentPage 호출
  //    - 일관된 이벤트 기반 렌더링 흐름
  window.dispatchEvent(new PopStateEvent("popstate"));
};
