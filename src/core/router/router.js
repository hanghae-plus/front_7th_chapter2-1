export class Router {
  static _instance = null;

  constructor($target, routes) {
    this.$target = $target;
    this.routes = routes;
    this.currentComponent = null;
    this.basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    Router._instance = this;
    this.init();
  }

  static getInstance() {
    return Router._instance;
  }

  // pathname에서 basePath를 제거한 경로 반환
  getPathname() {
    const pathname = location.pathname;
    if (this.basePath && pathname.startsWith(this.basePath)) {
      return pathname.slice(this.basePath.length) || "/";
    }
    return pathname;
  }

  // 절대 경로를 basePath를 포함한 경로로 변환
  getFullPath(path) {
    return `${this.basePath}${path}`;
  }

  init() {
    // 브라우저 뒤/앞 이동 시 라우트 재실행
    window.addEventListener("popstate", () => this.route());

    // Link 컴포넌트
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]");
      if (!link) return;

      e.preventDefault();
      const href = link.getAttribute("href");
      const fullPath = this.getFullPath(href);
      history.pushState(null, "", fullPath);
      this.route();
    });

    this.route();
  }

  matchRoute(pathname) {
    for (const route of this.routes) {
      const paramNames = [];

      // 경로 매칭
      const regexPath = route.path.replace(/\*/g, ".*").replace(/:([^/]+)/g, (_, key) => {
        paramNames.push(key);
        return "([^/]+)";
      });

      const regex = new RegExp(`^${regexPath}$`);
      const match = pathname.match(regex);

      if (match) {
        const params = paramNames.reduce((acc, key, i) => {
          acc[key] = match[i + 1];
          return acc;
        }, {});
        return { ...route, params };
      }
    }
    return null;
  }

  route() {
    const pathname = this.getPathname();
    const matched = this.matchRoute(pathname);

    // 현재 컴포넌트 언마운트
    if (this.currentComponent?.unmount) {
      this.currentComponent.unmount();
    }

    this.$target.innerHTML = "";

    if (matched) {
      const { layout, component } = matched;

      if (layout) {
        const LayoutComponent = layout;
        this.currentComponent = new LayoutComponent(this.$target, { children: component });
      } else {
        const PageComponent = component;
        this.currentComponent = new PageComponent(this.$target);
      }
    }
  }

  getParams() {
    const pathname = this.getPathname();
    const matched = this.matchRoute(pathname);
    return matched?.params || {};
  }

  getParam(key) {
    const params = this.getParams();
    return params[key];
  }
}
