import { routes } from "./Routes.js";

/**
 * @typedef {Object} Route
 * @property {string} path
 * @property {string} name
 * @property {() => string} render
 */

/**
 * @param {Route[]} routes
 */
export class RouterInstance {
  constructor(routes = []) {
    this.routes = routes;
    this.basePath = import.meta.env.BASE_URL;
    this.currentRoute = null;
    this.params = {};
    this.queryParams = {};
  }

  // 라우트 메소드

  init(renderCallback) {
    this.renderCallback = renderCallback;

    window.addEventListener("popstate", () => {
      this.#handleRoute();
    });

    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-link]");

      // a tag 막음
      if (link) {
        e.preventDefault();
        this.navigate(link.href);
      }
    });
  }

  /**
   * @param {string} path
   * @param {Object} option
   * @param {boolean} option.replace
   */
  navigate(path, option = {}) {
    const { replace = false } = option;
    const fullPath = this.basePath === "/" ? path : this.basePath + path;

    if (replace) {
      window.history.replaceState(null, "", fullPath);
    } else {
      window.history.pushState(null, "", fullPath);
    }

    this.#handleRoute();
  }

  // 라우트 헬퍼

  // 라우트 변경 처리
  #handleRoute() {
    const route = this.getCurrentRoute();

    if (!route) {
      throw new Error("Not Found Route");
    }

    this.currentRoute = route;
    this.renderCallback?.();
  }

  /**
   * @param {string} path
   * @returns {Route | undefined}
   */
  #matchRoute(path) {
    for (const route of this.routes) {
      if (route.path === path) {
        this.params = {};
        return route;
      }

      if (route.path.includes(":")) {
        const routeRegex = this.#pathToRegex(route.path);
        const match = path.match(routeRegex);
        if (match) {
          this.params = this.#extractParams(route.path, match);
          return route;
        }
      }
    }
  }

  /**
   * @param {string} path
   * @returns {RegExp}
   */
  #pathToRegex(path) {
    const pattern = path
      .replace(/\//g, "\\/") // 슬래시 이스케이프
      .replace(/:\w+/g, "([^\\/]+)"); // 파라미터 추출

    return new RegExp(`^${pattern}$`);
  }

  /**
   * @param {string} path
   * @param {RegExpMatchArray} match
   * @returns {Record<string, string>}
   */
  #extractParams(path, match) {
    const params = {};
    const paramNames = path.match(/:\w+/g) || [];

    paramNames.forEach((paramName, index) => {
      const key = paramName.slice(1);
      params[key] = match[index + 1];
    });

    return params;
  }

  // 게터

  /**
   * @returns {Route}
   */
  getCurrentRoute() {
    const path = this.getPath();
    const match = this.#matchRoute(path);
    const notFoundRoute = this.routes.find((route) => route.path === "*");

    return match ?? notFoundRoute;
  }

  /**
   * @returns {string}
   */
  getPath() {
    let pathName = window.location.pathname;

    // basePath 핸들링
    if (pathName.startsWith(this.basePath)) {
      pathName = pathName.slice(this.basePath.length) || "/";
    }

    return pathName.startsWith("/") ? pathName : "/" + pathName;
  }

  /**
   * @returns {Record<string, string>}
   */
  getParams() {
    return this.params;
  }

  /**
   * @returns {Record<string, string>}
   */
  getQueryParams() {
    const searchParams = new URLSearchParams(window.location.search);
    const queryParams = {};

    for (const [key, value] of searchParams) {
      queryParams[key] = value;
    }

    return queryParams;
  }
}

// 라우터 싱글톤 패턴
export const router = new RouterInstance(routes);
