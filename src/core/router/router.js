export class Router {
  constructor({ routes, outlet = "#app" }) {
    this.routes = routes;
    this.outlet = document.querySelector(outlet);
    this.init();
  }

  init() {
    window.addEventListener("popstate", () => this.route());
    document.addEventListener("click", (e) => {
      if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState(null, null, e.target.href);
        this.route();
      }
    });
    this.route();
  }

  matchRoute(pathname) {
    for (const route of this.routes) {
      const paramNames = [];

      // :param 패턴과 * 와일드카드를 모두 처리
      const regexPath = route.path
        .replace(/\*/g, ".*") // * → .* (와일드카드)
        .replace(/:([^/]+)/g, (_, key) => {
          paramNames.push(key);
          return "([^/]+)"; // :param → 캡처 그룹
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
    const match = this.matchRoute(pathname);
    if (match) {
      const component = new match.component(match.params);
      component.mount("#app"); // FIXME:
    }
  }
}
