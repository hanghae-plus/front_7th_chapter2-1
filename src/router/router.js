import { _404 } from "../pages/404";
import { PageLayout } from "../pages/PageLayout";

// 환경에 따라 BASE_PATH 설정
const BASE_PATH = import.meta.env.MODE === "production" ? "/front_7th_chapter2-1" : "";

// 베이스 경로를 제거한 pathname 반환
const getPathWithoutBase = (pathname) => {
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    return pathname.slice(BASE_PATH.length) || "/";
  }
  return pathname;
};

// 베이스 경로를 포함한 전체 경로 반환
const getFullPath = (pathname) => {
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    return pathname;
  }
  return BASE_PATH + pathname;
};

export const createRouter = () => {
  const routes = new Map();
  let currentRoute = null;

  // 라우트 매칭
  const matchRoute = (pathname) => {
    // 베이스 경로 제거
    const pathWithoutBase = getPathWithoutBase(pathname);

    // 쿼리 파라미터 제거 (pathname만 사용)
    const cleanPathname = pathWithoutBase.split("?")[0];

    // 정확히 일치하는 라우트
    if (routes.has(cleanPathname)) {
      return { handler: routes.get(cleanPathname), params: {} };
    }

    // 동적 라우트 매칭
    for (const [path, handler] of routes) {
      const paramNames = [];
      const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "([^/]+)";
      });

      const regex = new RegExp(`^${regexPath}$`);
      const match = cleanPathname.match(regex);

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
      $root.innerHTML = PageLayout({ children: _404 }); // 404도 레이아웃 적용
      return;
    }

    try {
      const content = await match.handler(match.params);
      // 상세 페이지 경로인지 확인 (/product/:id)
      const pathWithoutBase = getPathWithoutBase(pathname);
      const isDetailPage = pathWithoutBase.split("?")[0].startsWith("/product/");
      $root.innerHTML = PageLayout({ children: content, isDetailPage });
      currentRoute = pathname;
    } catch (error) {
      console.error("Render error:", error);
      $root.innerHTML = PageLayout({ children: "<h1>Error occurred</h1>" });
    }
  };

  const rerender = () => {
    return render(window.location.pathname);
  };

  // 라우트 등록
  const addRoute = (path, handler) => {
    routes.set(path, handler);
    return router;
  };

  // 경로 이동
  const push = (path) => {
    const fullPath = getFullPath(path);
    window.history.pushState(null, null, fullPath);
    render(fullPath);
  };

  // 경로 교체
  const replace = (path) => {
    const fullPath = getFullPath(path);
    window.history.replaceState(null, null, fullPath);
    render(fullPath);
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
    // 빈 문자열, null, undefined인 값 제거
    const filteredQuery = Object.entries(query).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const queryString = new URLSearchParams(filteredQuery).toString();
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
    rerender,
  };

  return router;
};
