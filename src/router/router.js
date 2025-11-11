export const createRouter = () => {
  const routes = new Map();
  let currentRoute = null;

  // 라우트 매칭
  const matchRoute = (pathname) => {
    // 정확히 일치하는 라우트
    if (routes.has(pathname)) {
      return { handler: routes.get(pathname), params: {} };
    }

    // 동적 라우트 매칭
    for (const [path, handler] of routes) {
      const paramNames = [];
      const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "([^/]+)";
      });

      const regex = new RegExp(`^${regexPath}$`);
      const match = pathname.match(regex);

      if (match) {
        const params = {};
        paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { handler, params };
      }
    }

    return null;
  };

  const render = async (pathname = window.location.pathname) => {
    const $root = document.querySelector("#root");
    const match = matchRoute(pathname);

    if (!match) {
      $root.innerHTML = "<h1>404 Not Found</h1>";
      return;
    }

    try {
      const content = await match.handler(match.params);
      $root.innerHTML = content;
      currentRoute = pathname;
    } catch (error) {
      console.error("Render error:", error);
      $root.innerHTML = "<h1>Error occurred</h1>";
    }
  };

  // 라우트 등록
  const addRoute = (path, handler) => {
    routes.set(path, handler);
    return router;
  };

  // 경로 이동
  const push = (path) => {
    window.history.pushState(null, null, path);
    render(path);
  };

  // 경로 교체
  const replace = (path) => {
    window.history.replaceState(null, null, path);
    render(path);
  };

  // 뒤로가기
  const back = () => {
    window.history.back();
  };

  // 쿼리 파라미터
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params);
  };

  const pushWithQuery = (path, query = {}) => {
    const queryString = new URLSearchParams(query).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    push(fullPath);
  };

  // 초기화
  const init = () => {
    window.addEventListener("popstate", () => {
      render();
    });
    render();
  };

  // 현재 라우트 정보
  const getCurrentRoute = () => currentRoute;

  const router = {
    addRoute,
    push,
    replace,
    back,
    getQueryParams,
    pushWithQuery,
    init,
    getCurrentRoute,
  };

  return router;
};
