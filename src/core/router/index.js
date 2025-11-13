import { extractParams } from "../../utils/route";

/** @typedef {import('../../types.js').Routes} Routes */
/** @typedef {import('../../types.js').RouteConfig} RouteConfig */

export default class Router {
  /**
   * @type {Routes}
   */
  static routes = {};
  /**
   * @type {string}
   */
  static basePath = "";
  /**
   * @type {HTMLElement | null}
   */
  static container = null;

  /** @type {boolean} */
  static initialized = false;

  /**
   * @param {Routes} routes
   * @param {string} basePath
   * @param {HTMLElement} container
   */
  static init(routes, basePath, container) {
    if (Router.initialized) {
      console.warn("[Router] Already initialized");
      return;
    }

    Router.routes = routes;
    Router.basePath = basePath;
    Router.container = container;

    window.addEventListener("popstate", Router.#renderFromLocation);
  }

  /**
   * @param {string} path
   */
  static push(path) {
    const normalized = Router.#normalize(path);
    const route = Router.#match(normalized);
    if (!route) throw new Error("Route not found");

    history.pushState(null, "", `${Router.basePath}${path.replace("/", "")}`);

    Router.#render(route, normalized);
  }

  /**
   * @param {string} path
   */
  static replace(path) {
    const normalized = Router.#normalize(path);
    const route = Router.#match(normalized);
    if (!route) throw new Error("Route not found");

    const url = Router.#absolute(normalized);
    history.replaceState(null, "", url);

    Router.#render(route, normalized);
  }

  static goBack() {
    history.back();
  }

  static #renderFromLocation() {
    const abs = window.location.pathname;
    const rel = Router.#relative(abs);
    const route = Router.#match(rel);

    if (!route) {
      if (Router.routes.notFound) {
        if (Router.container) {
          Router.container.replaceChildren(Router.routes.notFound.render({}));
        }
      }
      return;
    }
    Router.#render(route, rel);
  }

  /**
   * @param {RouteConfig} route
   * @param {string} path
   */
  static async #render(route, path) {
    if (!Router.container) throw new Error("Router not initialized");

    try {
      const params = extractParams(route.path, path);
      const props = await route.loader(params);
      Router.container.replaceChildren(route.render(props));
    } catch (err) {
      console.error(err);
      Router.container.replaceChildren(Router.routes.notFound.render({}));
    }
  }

  // Utils
  /**
   * @param {string} path
   * @returns {string}
   */
  static #normalize(path) {
    if (!path) return "/";
    return "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");
  }

  /**
   * @param {string} relativePath
   * @returns {string}
   */
  static #absolute(relativePath) {
    const base = Router.basePath.replace(/\/+$/, "");
    return `${base}${relativePath}`;
  }

  /**
   * @param {string} absolutePath
   * @returns {string}
   */
  static #relative(absolutePath) {
    let base = Router.basePath;
    if (!base.endsWith("/")) {
      base = base + "/";
    }
    let relative = absolutePath;
    if (absolutePath.startsWith(base)) {
      relative = absolutePath.slice(base.length);
    }
    if (!relative.startsWith("/")) {
      relative = "/" + relative;
    }
    if (relative !== "/") {
      relative = relative.replace(/\/+$/, "");
    }
    return relative;
  }
  /**
   * @param {string} path
   * @returns {RouteConfig | undefined}
   */
  static #match(path) {
    const route = Object.values(Router.routes).find((r) => r.pattern?.test(path));
    return route;
  }
}
