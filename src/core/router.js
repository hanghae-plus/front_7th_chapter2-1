// 라우터
// url 경로 감지 -> 해당 페이지 렌더
import { createObserver } from "./observer.js";

const observer = createObserver();

// base URL 제거 헬퍼 함수
const getPathWithoutBase = () => {
  const base = import.meta.env.BASE_URL || "/";
  const pathname = window.location.pathname;

  // base가 '/'가 아닌 경우 제거
  if (base !== "/" && pathname.startsWith(base)) {
    return pathname.slice(base.length - 1) || "/";
  }
  return pathname;
};

// router 초기화
export const router = {
  routes: {},
  currentPath: getPathWithoutBase(),
  currentPage: null, // 현재 활성화된 페이지 추적
  subscribe: observer.subscribe,
  notify: observer.notify,

  setup(routes) {
    this.routes = routes;

    window.addEventListener("popstate", () => {
      this.currentPath = getPathWithoutBase();
      this.handleRouteChange();
    });

    // 초기 라우팅
    this.handleRouteChange();
  },

  navigate(path) {
    const base = import.meta.env.BASE_URL || "/";
    const fullPath = base === "/" ? path : base.slice(0, -1) + path;
    history.pushState(null, null, fullPath);

    const pathWithoutQuery = path.split("?")[0];
    this.currentPath = pathWithoutQuery;

    this.handleRouteChange();
  },

  // 쿼리 파라미터 읽기
  getQueryParams() {
    return new URLSearchParams(window.location.search);
  },

  // 특정 쿼리 파라미터 값 가져오기
  getQueryParam(key, defaultValue = null) {
    const params = this.getQueryParams();
    return params.get(key) || defaultValue;
  },

  // 쿼리 파라미터 업데이트 (기존 파라미터 유지)
  updateQueryParams(newParams, options = { replace: true }) {
    const params = this.getQueryParams();

    // 새로운 파라미터로 업데이트 (null이면 삭제)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    const queryString = params.toString();
    const newURL = `${window.location.pathname}${queryString ? "?" + queryString : ""}`;

    if (options.replace) {
      window.history.replaceState({}, "", newURL);
    } else {
      window.history.pushState({}, "", newURL);
    }
  },

  // 쿼리 파라미터 전체 설정 (기존 것 덮어쓰기)
  setQueryParams(params, options = { replace: true }) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        searchParams.set(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const newURL = `${window.location.pathname}${queryString ? "?" + queryString : ""}`;

    if (options.replace) {
      window.history.replaceState({}, "", newURL);
    } else {
      window.history.pushState({}, "", newURL);
    }
  },

  // 쿼리 파라미터 제거 (경로만 남기기)
  clearQueryParams() {
    window.history.replaceState({}, "", window.location.pathname);
  },

  // 경로 변경 시 페이지 라이프사이클 관리
  handleRouteChange() {
    const { page, props } = this.getPageConfig();

    // 이전 페이지 정리 (destroy 호출)
    if (this.currentPage && this.currentPage.destroy) {
      console.log("🔄 이전 페이지 destroy 호출");
      this.currentPage.destroy();
    }
    // 새 페이지로 전환
    this.currentPage = page;
    console.log("🔄 새 페이지 currentPage 전환", this.currentPage);
    // 3. 새 페이지 초기화 (init 호출)
    if (this.currentPage && this.currentPage.init) {
      console.log("🔄 새 페이지 init 호출");
      this.currentPage.init(() => this.notify(), props);
    }
    // 렌더링
    this.notify();
  },

  getPageConfig() {
    const path = this.currentPath;

    if (path === "/") {
      return {
        page: this.routes["/"].page,
        props: {},
      };
    } else if (path.startsWith("/product/")) {
      const productId = path.split("/").pop();
      return {
        page: this.routes["/product/:id"].page,
        props: { productId },
      };
    } else {
      return {
        page: this.routes["*"].page,
        props: {},
      };
    }
  },

  // 현재 페이지 가져오기
  getCurrentPage() {
    return this.currentPage;
  },
};
