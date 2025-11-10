import { stringifyQuery } from "./queryParser";
import { renderCurrentPage } from "./renderer";

/**
 * 프로그래밍 방식으로 페이지 이동
 * @param {Array} routes - 라우트 설정 배열
 * @param {string} path - 이동할 경로 (예: "/", "/product/123")
 * @param {Object} query - 쿼리 파라미터 객체 (예: { search: "신발" })
 */
export const navigateTo = (routes, path, query = {}) => {
  // 1. stringifyQuery(query)로 쿼리 객체를 문자열로 변환
  const queryString = stringifyQuery(query);

  // 2. 쿼리 문자열이 있으면 path에 "?" 붙여서 합치기
  const fullPath = queryString ? `${path}?${queryString}` : path;

  // 3. history.pushState({}, "", fullPath)
  //    - 새로고침 없이 URL 변경
  //    - 브라우저 히스토리에 추가
  history.pushState({}, "", fullPath);

  // 4. renderCurrentPage(routes) 호출
  //    - 변경된 URL에 맞는 페이지 렌더링
  renderCurrentPage(routes);
};
