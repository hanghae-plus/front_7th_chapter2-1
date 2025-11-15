import { ErrorPage } from "../pages/ErrorPage.js";
import { matchStaticRoute, matchDynamicRoute, extractParams } from "./routerUtils.js";
import { getBasePath, buildFullPath } from "../handlers/utils/urlHelpers.js";

export function createRouter(routes) {
  // base path 설정 (프로덕션: /front_7th_chapter2-1/, 개발: /)
  const basePath = getBasePath();

  const getCurrentPath = () => {
    let fullPath = window.location.pathname;
    if (basePath === "/") {
      // base path가 없으면 끝의 슬래시만 제거 (루트 제외)
      return fullPath === "/" ? "/" : fullPath.replace(/\/$/, "");
    }
    // base path 제거 (정확히 매칭되도록)
    if (fullPath.startsWith(basePath)) {
      let pathWithoutBase = fullPath.slice(basePath.length);
      // 슬래시로 시작하도록 보장
      if (!pathWithoutBase.startsWith("/")) {
        pathWithoutBase = `/${pathWithoutBase}`;
      }
      // 끝의 슬래시 제거 (루트 경로 제외)
      if (pathWithoutBase !== "/" && pathWithoutBase.endsWith("/")) {
        pathWithoutBase = pathWithoutBase.slice(0, -1);
      }
      return pathWithoutBase;
    }
    // base path가 없으면 끝의 슬래시만 제거 (루트 제외)
    return fullPath === "/" ? "/" : fullPath.replace(/\/$/, "");
  };

  const findMatchedRoute = (currentPath) => {
    return (
      routes.find((r) => matchStaticRoute(r, currentPath)) || routes.find((r) => matchDynamicRoute(r, currentPath))
    );
  };

  const getRouteParams = (route, currentPath) => {
    return route.path.includes(":") ? extractParams(route.path, currentPath) : {};
  };

  const render404 = () => {
    const $root = document.querySelector("#root");
    if ($root) {
      $root.innerHTML = ErrorPage();
    }
  };

  const mountComponent = async (route, params) => {
    const $root = document.querySelector("#root");
    if (!$root) return;

    const component = route.element();
    await component.mount({ params }, $root);
  };

  /**
   * 라우트 처리 (URL만 관리, 상태는 컴포넌트가 관리)
   */
  const handleRoute = async () => {
    const currentPath = getCurrentPath();
    const matchedRoute = findMatchedRoute(currentPath);

    if (!matchedRoute) {
      render404();
      return;
    }

    const params = getRouteParams(matchedRoute, currentPath);
    await mountComponent(matchedRoute, params);
  };

  /**
   * 라우터 초기화 함수
   */
  const initRouter = () => {
    window.addEventListener("popstate", handleRoute);
    handleRoute(); // 첫 화면 렌더링
  };

  /**
   * 라우팅 네비게이션 함수
   * @param {string} path - 이동할 경로 (예: "/", "/product/123")
   */
  const navigateTo = (path) => {
    const fullPath = buildFullPath(path);
    window.history.pushState({}, "", fullPath);
    handleRoute();
  };

  return { initRouter, navigateTo };
}
