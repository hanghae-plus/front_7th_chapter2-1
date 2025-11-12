export class Router {
  static _instance = null;

  constructor($target, routes) {
    this.$target = $target;
    this.routes = routes;
    this.currentComponent = null;
    Router._instance = this;
    this.init();
  }

  static getInstance() {
    return Router._instance;
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
      history.pushState(null, "", href);
      this.route();
    });

    this.route();
  }

  push(path) {
    history.pushState(null, "", path);
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
    const pathname = location.pathname;
    const matched = this.matchRoute(pathname);

    // 현재 컴포넌트 언마운트
    if (this.currentComponent?.unmount) {
      this.currentComponent.unmount();
    }

    this.$target.innerHTML = "";

    if (matched) {
      const PageComponent = matched.component;

      this.currentComponent = new PageComponent(this.$target);
    }
  }
}

export const router = Router.getInstance();
