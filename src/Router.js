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

        return route.path.split("/").every((fragment, idx) => {
          const pathFragments = path.split("/");

          if (pathFragments[idx] === undefined) {
            return false;
          }

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
