// 라우터
// 라우터는 뭘해야 되나
// url 경로 감지 -> 해당 페이지 렌더
import { createObserver } from "./observer.js";

const observer = createObserver();

// router 초기화
export const router = {
  routes: {},
  currentPath: window.location.pathname,
  subscribe: observer.subscribe,
  notify: observer.notify,

  setup(routes) {
    this.routes = routes;

    window.addEventListener("popstate", () => {
      this.currentPath = window.location.pathname;
      this.handleRouteChange();
      //this.notify(); // 라우트 변경 알림
    });
    //this.notify(); // 초기 렌더
    this.handleRouteChange();
  },

  navigate(path) {
    history.pushState(null, null, path);
    this.currentPath = path;
    this.handleRouteChange();
    //this.notify(); // 라우트 변경 알림
  },

  // 경로 변경 시 api 호출 및 렌더
  handleRouteChange() {
    const { onEnter, props } = this.getComponent();
    // onEnter 함수 실행
    if (onEnter) {
      onEnter(props);
    }
    // 렌더
    this.notify();
  },

  getComponent() {
    const path = this.currentPath;
    if (path === "/") {
      const route = this.routes["/"];
      return {
        component: route.component,
        props: { loading: true },
        onEnter: route.onEnter,
      };
    } else if (path.startsWith("/products/")) {
      const route = this.routes["/products/:id"];
      const productId = path.split("/").pop();
      return {
        component: route.component,
        props: { loading: true, productId: productId },
        onEnter: route.onEnter,
      };
    } else {
      const route = this.routes["*"];
      return {
        component: route.component,
        props: {},
      };
    }
  },
};
