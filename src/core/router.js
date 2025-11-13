/**
 * SPA 라우터
 * 클라이언트 사이드 라우팅을 처리합니다.
 */
export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.init();
  }

  init() {
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });
  }

  handleRoute() {
    const path = window.location.pathname;

    for (const [pattern, handler] of Object.entries(this.routes)) {
      const match = this.matchRoute(path, pattern);
      if (match) {
        handler(match.params);
        return;
      }
    }

    // 404 처리
    if (this.routes["*"]) {
      this.routes["*"]();
    }
  }

  matchRoute(path, pattern) {
    // /product/:id 형태의 패턴 매칭
    const paramNames = [];
    const regexPattern = pattern
      .replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return "([^/]+)";
      })
      .replace(/\*/g, ".*");

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (!match) {
      return null;
    }

    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return { params };
  }

  navigateTo(path) {
    window.history.pushState(null, "", path);
    this.handleRoute();
  }

  goBack() {
    window.history.back();
  }
}
