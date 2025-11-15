/**
 * 정적 라우트 매칭
 * @param {Object} route - 라우트 객체
 * @param {string} currentPath - 현재 경로
 * @returns {boolean} 매칭 여부
 */
export function matchStaticRoute(route, currentPath) {
  return route.path === currentPath;
}

/**
 * 동적 라우트 매칭
 * @param {Object} route - 라우트 객체
 * @param {string} currentPath - 현재 경로
 * @returns {boolean} 매칭 여부
 */
export function matchDynamicRoute(route, currentPath) {
  if (!route.path.includes(":")) return false;

  // '/product/:id' → /^\/product\/[^/]+$/
  const regex = new RegExp("^" + route.path.replace(/:\w+/g, "[^/]+") + "$");
  return regex.test(currentPath);
}

/**
 * 동적 파라미터 추출
 * @param {string} routePath - 라우트 경로 (예: '/product/:id')
 * @param {string} currentPath - 현재 경로 (예: '/product/123')
 * @returns {Object} 파라미터 객체 (예: { id: '123' })
 */
export function extractParams(routePath, currentPath) {
  const paramNames = routePath
    .split("/")
    .filter((p) => p.startsWith(":"))
    .map((p) => p.slice(1));

  const paramValues = currentPath.split("/").slice(-paramNames.length);
  return Object.fromEntries(paramNames.map((n, i) => [n, paramValues[i]]));
}
