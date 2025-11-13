const DEFAULT_NOT_FOUND = () => /*html*/ `
  <main class="max-w-md mx-auto px-4 py-12 text-center text-gray-700">
    <h1 class="text-2xl font-semibold mb-2">페이지를 찾을 수 없어요</h1>
    <p class="text-sm text-gray-500 mb-6">잘못된 주소이거나 이동된 페이지일 수 있습니다.</p>
    <a href="/" data-link class="text-blue-600 hover:text-blue-700">홈으로 돌아가기</a>
  </main>
`;

const trimSlashes = (value = "") => value.replace(/\/+$/, "") || "/";

const splitPath = (pattern) => trimSlashes(pattern).split("/").filter(Boolean);

const getBasePath = () => {
  // Vite의 BASE_URL을 사용하거나, 기본값으로 "/" 사용
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const removeBasePath = (pathname) => {
  const base = getBasePath();
  if (base === "/") {
    return pathname;
  }
  if (pathname.startsWith(base)) {
    return pathname.slice(base.length) || "/";
  }
  return pathname;
};

const matchPath = (pattern, pathname) => {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(pathname);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  return patternParts.reduce((params, segment, index) => {
    if (!params) {
      return null;
    }

    const value = pathParts[index];

    if (segment.startsWith(":")) {
      const key = segment.slice(1);
      return { ...params, [key]: decodeURIComponent(value) };
    }

    return segment === value ? params : null;
  }, {});
};

export class Router {
  constructor({ routes = [], rootSelector = "#root", notFound = DEFAULT_NOT_FOUND } = {}) {
    this.routes = [...routes];
    this.rootSelector = rootSelector;
    this.notFound = notFound;
    this.listeners = new Set();
    this.isStarted = false;

    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
  }

  static create(options) {
    return new Router(options);
  }

  register(route) {
    this.routes.push(route);
    return this;
  }

  use(routes = []) {
    routes.forEach((route) => this.register(route));
    return this;
  }

  match(pathname) {
    for (const route of this.routes) {
      const params = matchPath(route.path, pathname);
      if (params) {
        return { route, params };
      }
    }
    return null;
  }

  async render(state = {}) {
    const target = document.querySelector(this.rootSelector);

    if (!target) {
      throw new Error(`Router: DOM element "${this.rootSelector}"를 찾을 수 없습니다.`);
    }

    const pathname = trimSlashes(removeBasePath(window.location.pathname));
    const matched = this.match(pathname);
    const context = {
      pathname,
      state,
      params: matched?.params ?? {},
      query: Object.fromEntries(new URLSearchParams(window.location.search)),
    };

    const viewFactory = matched?.route?.element ?? this.notFound;
    const html = await Promise.resolve(viewFactory(context));

    target.innerHTML = html;
    this.notify(context);
  }

  start() {
    if (this.isStarted) {
      return;
    }

    document.addEventListener("click", this.handleLinkClick);
    window.addEventListener("popstate", this.handlePopState);

    this.isStarted = true;
    this.render();
  }

  stop() {
    if (!this.isStarted) {
      return;
    }

    document.removeEventListener("click", this.handleLinkClick);
    window.removeEventListener("popstate", this.handlePopState);

    this.isStarted = false;
  }

  navigate(url, { replace = false, state = {} } = {}) {
    const base = getBasePath();
    const fullUrl = url.startsWith("/") ? `${base}${url}` : url;

    if (replace) {
      window.history.replaceState(state, "", fullUrl);
    } else {
      window.history.pushState(state, "", fullUrl);
    }

    return this.render(state);
  }

  push(url, state) {
    return this.navigate(url, { state });
  }

  replace(url, state) {
    return this.navigate(url, { replace: true, state });
  }

  back() {
    window.history.back();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener) {
    this.listeners.delete(listener);
  }

  notify(context) {
    this.listeners.forEach((listener) => {
      try {
        listener(context);
      } catch (error) {
        console.error("Router listener error:", error);
      }
    });
  }

  handlePopState(event) {
    this.render(event.state);
  }

  handleLinkClick(event) {
    const anchor = event.target.closest("a[data-link]");

    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
      return;
    }

    const href = anchor.getAttribute("href") ?? anchor.dataset.href;

    if (!href || href.startsWith("http")) {
      return;
    }

    event.preventDefault();
    this.push(href);
  }
}

export const createRouter = (options) => new Router(options);
