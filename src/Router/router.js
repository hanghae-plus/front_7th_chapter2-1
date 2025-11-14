import { renderHeader } from "../layouts/headerRenderer.js";

const createRouter = () => {
  const baseUrl = "/front_7th_chapter2-1";
  let routes = [];
  let notFoundComponent = () => "<h1>404 Not Found</h1>";
  let currentOnUnmount = null;

  const handlePathChange = () => {
    if (currentOnUnmount) {
      currentOnUnmount();
      currentOnUnmount = null;
    }

    renderHeader();

    const path = window.location.pathname.startsWith(baseUrl)
      ? window.location.pathname.slice(baseUrl.length) || "/"
      : window.location.pathname;
    const route = routes.find((r) => r.path.test(path));
    const $mainContentContainer = document.getElementById("main-content-container");

    if (!$mainContentContainer) {
      console.error("Main content container not found.");
      return;
    }

    const queryParams = Object.fromEntries(new URLSearchParams(window.location.search));
    let pageComponent;

    if (route) {
      const pathParams = path.match(route.path)?.groups || {};
      pageComponent = route.component({ params: { ...pathParams, ...queryParams } });
    } else {
      pageComponent = notFoundComponent();
    }

    $mainContentContainer.innerHTML = pageComponent.html;
    if (pageComponent.onMount) {
      currentOnUnmount = pageComponent.onMount();
    }
  };

  const router = {
    addRoute(path, component) {
      routes.push({ path, component });
    },
    setNotFound(component) {
      notFoundComponent = component;
    },
    updateQuery(newQuery) {
      const params = new URLSearchParams(window.location.search);
      Object.entries(newQuery).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const currentPath = window.location.pathname.startsWith(baseUrl)
        ? window.location.pathname.slice(baseUrl.length)
        : window.location.pathname;
      const newUrl = `${baseUrl}${currentPath}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
      handlePathChange();
    },
    navigate(path) {
      window.history.pushState({}, "", `${baseUrl}${path}`);
      handlePathChange();
    },
    start() {
      window.addEventListener("popstate", handlePathChange);
      document.addEventListener("click", (e) => {
        const target = e.target.closest("[data-link]");
        if (target) {
          e.preventDefault();
          this.navigate(target.getAttribute("href"));
        }
      });
      handlePathChange();
    },
  };
  return router;
};

export const router = createRouter();
