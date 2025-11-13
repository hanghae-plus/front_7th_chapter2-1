import { matchPath } from "./pathMatcher";

/**
 * 라우트 배열에서 현재 경로와 매칭되는 라우트 찾기
 * @param {Array} routes - 라우트 설정 배열
 * @param {string} pathname - 현재 경로 (예: "/product/123")
 * @returns {Object} { route, params }
 */
export const findMatchingRoute = (routes, pathname) => {
  // 0. BASE_URL이 있으면 제거 (예: /front_7th_chapter2-1/ -> /)
  const basePath = import.meta.env.BASE_URL || "/";
  let normalizedPath = pathname;

  if (basePath !== "/" && pathname.startsWith(basePath)) {
    normalizedPath = pathname.slice(basePath.length - 1);
  }

  // 1. routes 배열을 순회하면서
  for (const route of routes) {
    // 2. 각 route.path와 normalizedPath를 matchPath로 비교
    const result = matchPath(route.path, normalizedPath);

    // 3. 매칭되면 { route, params } 반환
    if (result.matched) {
      return { route, params: result.params };
    }
  }

  // 4. 모든 라우트와 매칭 안 되면 null 반환
  return null;
};
