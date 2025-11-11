import { parseQuery } from "./queryParser";
import { findMatchingRoute } from "./routeMatcher";

// 현재 활성화된 클린업 함수
let currentCleanup = null;

/**
 * 현재 URL에 맞는 페이지를 렌더링
 * @param {Array} routes - 라우트 설정 배열
 */
export const renderCurrentPage = async (routes) => {
  // 1. 이전 페이지의 클린업 실행
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // 2. location.pathname 가져오기 (현재 경로)
  const currentPath = location.pathname;
  // 3. location.search 가져오기 (쿼리 문자열)
  const currentSearch = location.search;

  // 4. findMatchingRoute()로 매칭되는 라우트 찾기
  const matchResult = findMatchingRoute(routes, currentPath);

  // 5. 매칭되는 라우트가 없으면 종료
  if (!matchResult) {
    console.error("[오류] 매칭되는 라우트 없음:", currentPath);
    return;
  }

  const { route, params } = matchResult;

  // 6. parseQuery()로 쿼리 문자열을 객체로 변환
  const query = parseQuery(currentSearch);

  const $root = document.querySelector("#root");

  // 7. 로딩 상태로 먼저 렌더링 (동기)
  if (route.component.loading) {
    const loadingHtml = route.component.loading({ params, query });
    $root.innerHTML = loadingHtml;
  }

  // 8. route.component를 호출하고 await로 HTML 받아오기
  const html = await route.component({ params, query });

  // 9. #root에 HTML 삽입
  $root.innerHTML = html;

  // 10. 페이지별 핸들러 설정
  if (route.setupHandlers) {
    currentCleanup = route.setupHandlers();
  }

  // 11. 페이지 상단으로 스크롤
  window.scrollTo(0, 0);
};
