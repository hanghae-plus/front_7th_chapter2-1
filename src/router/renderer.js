import { parseQuery } from "./queryParser";
import { findMatchingRoute } from "./routeMatcher";

/**
 * 현재 URL에 맞는 페이지를 렌더링
 * @param {Array} routes - 라우트 설정 배열
 */
export const renderCurrentPage = async (routes) => {
  // 1. location.pathname 가져오기 (현재 경로)
  const currentPath = location.pathname;
  // 2. location.search 가져오기 (쿼리 문자열)
  const currentSearch = location.search;

  // 3. findMatchingRoute()로 매칭되는 라우트 찾기
  const matchResult = findMatchingRoute(routes, currentPath);

  // 4. 매칭되는 라우트가 없으면 종료
  if (!matchResult) {
    console.error("[오류] 매칭되는 라우트 없음:", currentPath);
    return;
  }

  const { route, params } = matchResult;

  // 5. parseQuery()로 쿼리 문자열을 객체로 변환
  const query = parseQuery(currentSearch);

  // 6. route.component를 호출하고 await로 HTML 받아오기
  const html = await route.component({ params, query });

  // 7. #root에 HTML 삽입
  const $root = document.querySelector("#root");
  $root.innerHTML = html;
};
