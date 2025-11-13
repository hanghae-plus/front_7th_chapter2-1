import { ErrorPage } from "../pages/ErrorPage.js";

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

export function createRouter(routes) {
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

  /**
   * 라우트 처리 (URL만 관리, 상태는 컴포넌트가 관리)
   */
  const handleRoute = async () => {
    // 현재 URL에서 base path 제거
    const fullPath = window.location.pathname;
    const currentPath = getPathWithoutBase(fullPath);

    const matchedRoute =
      routes.find((r) => matchStaticRoute(r, currentPath)) || routes.find((r) => matchDynamicRoute(r, currentPath));

    const $root = document.querySelector("#root");
    if (!matchedRoute) {
      // 404 페이지 렌더링
      $root.innerHTML = ErrorPage();

      return;
    }

    // params 처리 (동적일 경우만)
    const params = matchedRoute.path.includes(":") ? extractParams(matchedRoute.path, currentPath) : {};

    // 페이지 컴포넌트 생성 (페이지가 자신의 컴포넌트를 생성)
    const component = matchedRoute.element();

    // 컴포넌트 마운트 (params만 전달, 나머지는 컴포넌트가 URL에서 직접 읽음)
    await component.mount(
      {
        params,
      },
      $root,
    );
  };

  return { initRouter, navigateTo };
}
