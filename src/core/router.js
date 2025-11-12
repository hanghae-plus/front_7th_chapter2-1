// 라우터
// url 경로 감지 -> 해당 페이지 렌더
import { createObserver } from "./observer.js";

const observer = createObserver();

// router 초기화
export const router = {
  routes: {},
  currentPath: window.location.pathname,
  currentPage: null, // 현재 활성화된 페이지 추적
  subscribe: observer.subscribe,
  notify: observer.notify,

  setup(routes) {
    this.routes = routes;

    window.addEventListener("popstate", () => {
      this.currentPath = window.location.pathname;
      this.handleRouteChange();
    });

    // 초기 라우팅
    this.handleRouteChange();
  },

  navigate(path) {
    history.pushState(null, null, path);
    console.log("🔄 navigate 호출", path);
    this.currentPath = path;
    this.handleRouteChange();
  },

  // 경로 변경 시 페이지 라이프사이클 관리
  handleRouteChange() {
    const { page, props } = this.getPageConfig();
    // 1. 이전 페이지 정리 (destroy 호출)
    if (this.currentPage && this.currentPage.destroy) {
      console.log("🔄 이전 페이지 destroy 호출");
      this.currentPage.destroy();
    }
    // 2. 새 페이지로 전환
    this.currentPage = page;
    console.log("🔄 새 페이지 currentPage 전환", this.currentPage);
    // 3. 새 페이지 초기화 (init 호출)
    if (this.currentPage && this.currentPage.init) {
      console.log("🔄 새 페이지 init 호출");
      this.currentPage.init(() => this.notify(), props);
    }

    // 4. 렌더링
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
        page: this.routes["/products/:id"].page,
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
