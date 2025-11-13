// 전역 router 인스턴스
let routerInstance = null;

// router 초기화 함수
export const initRouter = (routers) => {
  // 기존 router 인스턴스가 있으면 정리
  if (routerInstance && routerInstance.destroy) {
    routerInstance.destroy();
  }

  routerInstance = createRouter(routers);
  routerInstance.setup();
  return routerInstance;
};

// router 인스턴스 가져오기
export const Router = () => {
  if (!routerInstance) {
    throw new Error("Router가 초기화되지 않았습니다. initRouter()를 먼저 호출하세요.");
  }
  return routerInstance;
};

export const createRouter = (routers) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  const getBaseUrl = () => {
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  };

  const findCurrentRouter = (currentPath) => {
    return routers.find((router) => {
      const regexPath = router.path
        .replace(/\/:\w+/g, "/([^/]+)") // :param → 캡처 그룹
        .replace(/\//g, "\\/"); // 슬래시 이스케이프

      const regex = new RegExp(`^${regexPath}$`);
      return regex.test(currentPath);
    });
  };

  // 라우트 매칭 및 렌더링 로직
  const handleRoute = () => {
    const pathName = window.location.pathname;
    const currentPath = pathName.replace(getBaseUrl(), "");

    const currentRouter = findCurrentRouter(currentPath);
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

  // URL에서 파라미터 추출
  const getParams = () => {
    const pathName = window.location.pathname;
    const currentPath = pathName.replace(getBaseUrl(), "");

    // 현재 경로와 매칭되는 라우터 찾기
    const currentRouter = findCurrentRouter(currentPath);

    if (!currentRouter || !currentRouter.path.includes(":")) {
      return {};
    }

    // 파라미터 이름 추출
    const paramNames = [];
    const paramRegex = /:(\w+)/g;
    let match;
    while ((match = paramRegex.exec(currentRouter.path)) !== null) {
      paramNames.push(match[1]);
    }

    // 파라미터 값 추출
    const regexPath = currentRouter.path.replace(/\/:\w+/g, "/([^/]+)").replace(/\//g, "\\/");
    const regex = new RegExp(`^${regexPath}$`);
    const values = currentPath.match(regex);

    if (!values) {
      return {};
    }

    // 파라미터 이름과 값 매핑
    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = values[index + 1];
    });

    return params;
  };

  // setup()은 initRouter에서 호출하도록 나중으로 연기
  return { push, destroy, getParams, setup };
};
