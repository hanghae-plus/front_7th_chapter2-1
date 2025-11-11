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
    const fullPath = basePath + path.replace(/^\//, "");
    window.history.pushState({}, "", fullPath);
    handleRoute();
  };

  const handleRoute = async () => {
    // 현재 URL에서 base path 제거
    const fullPath = window.location.pathname;
    const currentPath = getPathWithoutBase(fullPath);

    // 현재 경로에 해당하는 컴포넌트 찾기
    // FIXME : 동적 라우팅 부분 수정
    const matchedRoute = routes.find((route) => route.path === currentPath);

    const $root = document.querySelector("#root");
    if (!matchedRoute) {
      $root.innerHTML = `<h1>404 Not Found</h1>`;
      return;
    }

    // 로딩 표시
    $root.innerHTML = `<div>로딩 중...</div>`;

    // 해당 컴포넌트 렌더링 (async!)
    const html = await matchedRoute.element({ ...state.getState(), params: {} });
    $root.innerHTML = html;
  };

  return { initRouter, navigateTo };
}
