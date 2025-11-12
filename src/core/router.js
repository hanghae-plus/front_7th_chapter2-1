// 정적 라우트 매칭
function matchStaticRoute(route, currentPath) {
  return route.path === currentPath;
}

// 동적 라우트 매칭
function matchDynamicRoute(route, currentPath) {
  if (!route.path.includes(":")) return false;

  // '/product/:id' → /^\/product\/[^/]+$/
  const regex = new RegExp("^" + route.path.replace(/:\w+/g, "[^/]+") + "$");
  return regex.test(currentPath);
}

// 동적 파라미터 추출
function extractParams(routePath, currentPath) {
  const paramNames = routePath
    .split("/")
    .filter((p) => p.startsWith(":"))
    .map((p) => p.slice(1));

  const paramValues = currentPath.split("/").slice(-paramNames.length);
  return Object.fromEntries(paramNames.map((n, i) => [n, paramValues[i]]));
}

export function createRouter(routes, state) {
  // base path 설정 (개발: /, 배포: /front_7th_chapter2-1/)
  const basePath = import.meta.env.BASE_URL || "/";

  /**
   * base path 제거해서 실제 경로만 추출
   * /front_7th_chapter2-1/ → /
   * /front_7th_chapter2-1/product/123 → /product/123
   */
  const getPathWithoutBase = (fullPath) => {
    if (basePath === "/") return fullPath;
    return fullPath.replace(basePath, "/");
  };

  const initRouter = () => {
    window.addEventListener("popstate", handleRoute);
    handleRoute(); // 첫 화면 렌더링
  };

  const navigateTo = (path) => {
    // base path 포함해서 URL 변경
    const fullPath = basePath + path.replace(/^\//, "");
    window.history.pushState({}, "", fullPath);
    handleRoute();
  };

  const handleRoute = async () => {
    // 현재 URL에서 base path 제거
    const fullPath = window.location.pathname;
    const currentPath = getPathWithoutBase(fullPath);

    const matchedRoute =
      routes.find((r) => matchStaticRoute(r, currentPath)) || routes.find((r) => matchDynamicRoute(r, currentPath));

    console.log("matchedRoute:", matchedRoute);

    const $root = document.querySelector("#root");
    if (!matchedRoute) {
      $root.innerHTML = `<h1>404 Not Found</h1>`;
      return;
    }

    // params 처리 (동적일 경우만)
    const params = matchedRoute.path.includes(":") ? extractParams(matchedRoute.path, currentPath) : {};

    // 로딩 표시
    $root.innerHTML = `
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">로딩 중...</p>
        </div>
      </div>
    `;

    // 렌더링
    const html = await matchedRoute.element({ ...state.getState(), params });
    $root.innerHTML = html;

    // 페이지별 이벤트 리스너 붙이기
    if (matchedRoute.attachHandlers) {
      matchedRoute.attachHandlers();
    }
  };

  return { initRouter, navigateTo };
}
