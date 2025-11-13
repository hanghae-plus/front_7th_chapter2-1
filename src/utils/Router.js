import { NotFoundPage } from "../pages/NotFoundPage";

const convertToRelativePath2 = (pathName) => {
  const basePath = import.meta.env.BASE_URL;
  return pathName.replace(basePath, "/").replace(/\/$/, "") || "/";
};

export class Router {
  constructor($app) {
    this.$app = $app;
    this.routes = [];
    this.isPending = false;
    this.current = {
      view: null,
      loaderData: null,
      params: null,
      queryString: null,
    };
    this.init();
  }

  init() {
    window.addEventListener("popstate", () => {
      this.render();
    });
  }

  addRoute({ path, loader, component }) {
    this.routes.push({ path, loader, component });
  }

  #matchRoute(_path) {
    const path = convertToRelativePath2(_path);
    for (const route of this.routes) {
      const pathRegex = new RegExp("^" + route.path.replace(/:\w+/g, "([^/]+)") + "$");
      const match = path.match(pathRegex);

      if (match) {
        // 1. 경로 매개변수 (Path Params) 추출
        const paramNames = (route.path.match(/:\w+/g) || []).map((name) => name.substring(1));
        const params = match.slice(1).reduce((acc, value, index) => {
          acc[paramNames[index]] = value;
          return acc;
        }, {});

        // 2. 쿼리스트링 매개변수 (Query Params) 추가
        const qString = {};
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.size > 0) {
          for (const [qKey, value] of queryParams.entries()) {
            if (!(qKey in params)) {
              qString[qKey] = value;
            }
          }
        }

        return {
          component: route.component,
          loader: route.loader,
          params: params,
          queryString: qString,
        };
      }
    }
    return { component: NotFoundPage, loader: () => Promise.resolve({}), params: {}, queryString: {} };
  }

  async render({ withLoader = true } = {}) {
    this.isPending = true;
    const matched = this.#matchRoute(location.pathname);

    if (this.current.view && this.current.view.constructor !== matched.component) {
      this.current.view.unmount();
      this.current = {
        view: null,
        loaderData: null,
        params: null,
        queryString: null,
      };
    }

    // 1. Loading UI 렌더링 (isPending: true)
    if (!this.current.view) {
      this.current.view = new matched.component(this.$app, {
        params: matched.params,
        queryString: matched.queryString,
        isPending: this.isPending,
        loaderData: null,
      });
    } else {
      await this.current.view.updateProps({
        params: matched.params,
        queryString: matched.queryString,
        isPending: this.isPending,
        loaderData: this.current.loaderData,
      });
    }

    // 2. ⭐ 데이터 로딩 및 대기
    const fetchLoaderData =
      withLoader ||
      (JSON.stringify(matched.params) !== JSON.stringify(this.current.params) &&
        JSON.stringify(matched.queryString) !== JSON.stringify(this.current.queryString));
    if (fetchLoaderData) {
      try {
        this.current.params = matched.params;
        this.current.queryString = matched.queryString;
        this.current.loaderData = await matched.loader({ params: matched.params, queryString: matched.queryString });
      } catch (e) {
        this.current.loaderData = { error: e.message };
      }
    }

    // 3. 로딩 완료 후 최종 렌더링 (isPending: false)
    this.isPending = false;
    if (this.current.view && this.current.view.updateProps) {
      await this.current.view.updateProps({
        params: matched.params,
        queryString: matched.queryString,
        isPending: this.isPending,
        loaderData: this.current.loaderData,
      });
    }
  }

  navigateTo(path) {
    history.pushState(null, "", path);
    this.render(path);
  }
}
