class Router {
  constructor(routes) {
    this.routes = [...routes];
  }

  _handleRoute() {
    const path = window.location.pathname;

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

    if (route) {
      document.getElementById("root").innerHTML = /* HTML */ ` ${route.component()} `;
    }
  }

  push(path) {
    window.history.pushState({}, "", path);
    this._handleRoute();
  }

  replace(path) {
    window.history.replaceState({}, "", path);
    this._handleRoute();
  }

  init() {
    this._handleRoute();

    window.addEventListener("popstate", () => {
      this._handleRoute();
    });
  }
}

export default Router;
