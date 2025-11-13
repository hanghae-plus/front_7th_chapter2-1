import { ErrorPage } from "../pages/ErrorPage.js";
import { matchStaticRoute, matchDynamicRoute, extractParams } from "./routerUtils.js";

export function createRouter(routes) {
  // base path 설정 (프로덕션: /front_7th_chapter2-1/, 개발: /)
  const basePath = import.meta.env.BASE_URL || "/";

  const getCurrentPath = () => {
    const fullPath = window.location.pathname;
    return basePath === "/" ? fullPath : fullPath.replace(basePath, "/");
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
   * @param {*} path
   */
  const navigateTo = (path) => {
    const fullPath = basePath + path.replace(/^\//, "");
    window.history.pushState({}, "", fullPath);
    handleRoute();
  };

  return { initRouter, navigateTo };
}
