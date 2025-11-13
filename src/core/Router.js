export const createRouter = (routers) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  const getBaseUrl = () => {
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  };

  // 라우트 매칭 및 렌더링 로직
  const handleRoute = () => {
    const pathName = window.location.pathname;
    const currentPath = pathName.replace(getBaseUrl(), "");

    const currentRouter = routers.find((router) => {
      const regexPath = router.path
        .replace(/\/:\w+/g, "/([^/]+)") // :param → 캡처 그룹
        .replace(/\//g, "\\/"); // 슬래시 이스케이프

      const regex = new RegExp(`^${regexPath}$`);
      return regex.test(currentPath);
    });

    console.log("Current route:", currentPath, currentRouter);

    currentRouter?.page?.("#root");
  };

  // 이전 리스너를 제거하기 위해 저장
  let cleanupListener = null;

  const setup = () => {
    // 기존 리스너가 있으면 제거
    if (cleanupListener) {
      window.removeEventListener("popstate", cleanupListener);
    }

    // popstate: 브라우저 뒤로/앞으로 버튼
    cleanupListener = handleRoute;
    window.addEventListener("popstate", cleanupListener);

    // 초기 로드 시 현재 경로 처리
    handleRoute();
  };

  const push = (path) => {
    window.history.pushState(null, null, getBaseUrl() + path);
    handleRoute();
  };

  const destroy = () => {
    if (cleanupListener) {
      window.removeEventListener("popstate", cleanupListener);
      cleanupListener = null;
    }
  };

  setup();

  return { push, destroy };
};

// 전역 router 인스턴스
let routerInstance = null;

// router 초기화 함수
export const initRouter = (routers) => {
  // 기존 router 인스턴스가 있으면 정리
  if (routerInstance && routerInstance.destroy) {
    routerInstance.destroy();
  }

  routerInstance = createRouter(routers);
  return routerInstance;
};

// router 인스턴스 가져오기
export const Router = () => {
  if (!routerInstance) {
    throw new Error("Router가 초기화되지 않았습니다. initRouter()를 먼저 호출하세요.");
  }
  return routerInstance;
};
