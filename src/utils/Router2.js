/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-private-class-members */
import { NotFoundPage } from "../pages/NotFoundPage";

// TODO: 쿼리스트링 안 없앤 버전
const convertToRelativePath2 = (pathName) => {
  const basePath = import.meta.env.BASE_URL;
  return pathName.replace(basePath, "/").replace(/\/$/, "") || "/";
};

class Router {
  constructor($app) {
    this.$app = $app;
    this.routes = [];
    this.isPending = false;
    this.currentView = null;
    this.init();

    // TODO: 이거 쓰는건지 체크해보기!
    // window.navigation.addEventListener("navigate", (e) => console.log("TEST2: location changed!", { e }));
  }

  // TODO component -> Component
  addRoute({ path, loader, component }) {
    this.routes.push({ path, loader, component });
  }

  #matchRoute(path) {
    console.log({ path, convertedPath: convertToRelativePath2(path) });
    const [pathOnly, queryString] = path.split("?");
    for (const route of this.routes) {
      const pathRegex = new RegExp("^" + route.path.replace(/:\w+/g, "([^/]+)") + "$");
      const match = pathOnly.match(pathRegex);

      if (match) {
        // 1. 경로 매개변수 (Path Params) 추출
        const paramNames = (route.path.match(/:\w+/g) || []).map((name) => name.substring(1));
        const params = match.slice(1).reduce((acc, value, index) => {
          acc[paramNames[index]] = value;
          return acc;
        }, {});

        // 2. 쿼리스트링 매개변수 (Query Params) 추가
        const qString = {};
        if (queryString) {
          const queryParams = new URLSearchParams(queryString);
          for (const [qKey, value] of queryParams.entries()) {
            if (!(qKey in params)) {
              qString[qKey] = value;
            }
          }
        }

        return { component: route.component, loader: route.loader, params: params, queryString: qString };
      }
    }
    return { component: NotFoundPage, loader: () => Promise.resolve({}), params: {} };
  }

  async #render() {
    this.isPending = true;
    const currentPath = location.pathname;
    const matched = this.#matchRoute(currentPath);

    // https://gemini.google.com/app/851c271ec60bc31f 이어서 참조하기...
  }
}
