import { getProducts, getCategories, getProduct } from "../api/productApi.js";

// 페이지별 데이터 로딩 함수
async function loadPageData(currentPath, params, state) {
  // HomePage 데이터 로드
  if (currentPath === "/") {
    const [productsData, categories] = await Promise.all([
      getProducts({
        limit: state.limit,
        search: state.search,
        category1: state.category1,
        category2: state.category2,
        current: state.current,
        sort: state.sort,
      }),
      getCategories(),
    ]);
    return {
      products: productsData.products,
      pagination: productsData.pagination,
      categories,
    };
  }

  // DetailPage 데이터 로드
  if (currentPath.startsWith("/product/")) {
    const product = await getProduct(params.id);
    return { product };
  }

  return {};
}

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

  /**
   *
   * NOTE 전체적으로 사용자 이벤트 발생 -> URL 변경 -> handleRoute() 호출 -> 상태 동기화 -> 페이지 렌더링 되도록 설정
   */
  const handleRoute = async () => {
    // 현재 URL에서 base path 제거
    const fullPath = window.location.pathname;
    const currentPath = getPathWithoutBase(fullPath);

    // URL에서 searchParams 파싱 → Store 업데이트
    const urlParams = new URLSearchParams(window.location.search);
    const searchParamsState = {
      limit: parseInt(urlParams.get("limit")) || 20,
      search: urlParams.get("search") || "",
      category1: urlParams.get("category1") || "",
      category2: urlParams.get("category2") || "",
      current: parseInt(urlParams.get("current")) || 1,
      sort: urlParams.get("sort") || "price_asc",
    };

    // 전역 상태 업데이트 (URL이 단일 진실 공급원)
    state.setState(searchParamsState);

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

    // 로딩 UI 먼저 렌더링 (loading: true)
    const loadingHTML = matchedRoute.element({ ...state.getState(), params, loading: true });
    $root.innerHTML = loadingHTML;

    // 데이터 로드
    const pageData = await loadPageData(currentPath, params, state.getState());

    // 실제 데이터로 렌더링 (loading: false)
    const html = matchedRoute.element({ ...state.getState(), params, loading: false, ...pageData });
    $root.innerHTML = html;

    // 페이지별 이벤트 리스너 붙이기
    if (matchedRoute.attachHandlers) {
      matchedRoute.attachHandlers();
    }
  };

  return { initRouter, navigateTo };
}
