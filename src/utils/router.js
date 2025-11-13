import { DetailPage } from "../pages/DetailPage";
import { HomePage } from "../pages/HomePage";

const routes = [
  { path: "/", component: HomePage },
  { path: "/product/:id", component: DetailPage },
];

const pathToRegex = (path) => {
  return new RegExp("^" + path.replace(/:\w+/g, "([^/]+)") + "$");
};

export const findRoute = (pathname) => {
  for (const route of routes) {
    const regex = pathToRegex(route.path);
    const match = pathname.match(regex);
    if (match) {
      return { route, params: match.slice(1) };
    }
  }
  return null;
};

export const push = (path, { silent = false } = {}) => {
  const current = `${location.pathname}${location.search}`;
  if (current === path) return;

  history.pushState(null, null, path);
  if (!silent) {
    window.dispatchEvent(new Event("route-change"));
  }
};

export const initRouter = (renderFn) => {
  renderFn();

  window.addEventListener("route-change", renderFn);

  window.addEventListener("popstate", renderFn);
  document.body.addEventListener("click", (e) => {
    const element = e.target.closest("[data-link]");

    if (element) {
      e.preventDefault();
      const path = element.getAttribute("href") || element.getAttribute("data-link");
      if (path && path !== location.pathname) {
        push(path);
      }
    }
  });
};
