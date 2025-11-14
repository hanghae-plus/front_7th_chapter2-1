import { store } from "./store/Store.js";

class Router {
  constructor() {
    this.routes = [];
  }

  _handleRoute() {
    const baseUrl = import.meta.env.BASE_URL;
    const path = window.location.pathname.replace(baseUrl, "/");

    const getRoute = (path) => {
      const matchedRoute = this.routes.find((route) => {
        if (route.path === "*") {
          return false;
        }

        const routeFragments = route.path.split("/");
        const pathFragments = path.split("/");

        // 경로 세그먼트 개수가 다르면 매칭 실패
        if (routeFragments.length !== pathFragments.length) {
          return false;
        }

        return routeFragments.every((fragment, idx) => {
          if (fragment.startsWith(":")) {
            return true;
          }

          return fragment === pathFragments[idx];
        });
      });

      if (!matchedRoute) {
        return this.routes.find((route) => route.path === "*");
      }

      return matchedRoute;
    };

    const route = getRoute(path);

    console.log(route);

    if (route) {
      // 이전 페이지의 구독 정리
      store.clearObservers();

      const $root = document.getElementById("root");
      route.component($root);
    }
  }

  push(path) {
    window.history.pushState({}, "", `${path}`);
    this._handleRoute();
  }

  replace(path) {
    window.history.replaceState({}, "", `${path}`);
    this._handleRoute();
  }

  init(routes) {
    this.routes = [...routes];

    this._handleRoute();

    window.addEventListener("popstate", () => {
      this._handleRoute();
    });
  }
}

const router = new Router();

export default router;
