import { DetailPage } from "../pages/DetailPage";
import { HomePage } from "../pages/HomePage";

const routes = [
  { path: "/", component: HomePage },
  { path: "/product/:id", component: DetailPage },
];

const ensureLeadingSlash = (value = "/") => {
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
};

const normalizePath = (value = "/") => {
  const withLeading = ensureLeadingSlash(value.trim());
  if (withLeading === "/") return "/";
  return withLeading.replace(/\/+$/, "") || "/";
};

const basePath = normalizePath(import.meta.env.BASE_URL ?? "/");

const toAppPath = (pathname = "/") => {
  const normalized = normalizePath(pathname);
  if (basePath === "/") return normalized;
  if (!normalized.startsWith(basePath)) return normalized;
  const stripped = normalized.slice(basePath.length) || "/";
  return normalizePath(stripped);
};

const toBrowserPath = (appPath = "/") => {
  const normalized = normalizePath(appPath);
  if (basePath === "/") return normalized;
  return normalized === "/" ? `${basePath}/` : `${basePath}${normalized}`;
};

const pathToRegex = (path) => new RegExp("^" + path.replace(/:\w+/g, "([^/]+)") + "$");

export const findRoute = (pathname = "/") => {
  const currentPath = toAppPath(pathname);
  for (const route of routes) {
    const match = currentPath.match(pathToRegex(route.path));
    if (match) {
      return { route, params: match.slice(1) };
    }
  }
  return null;
};

export const push = (path = "/", { silent = false } = {}) => {
  const url = new URL(path, window.location.origin);
  const appPath = normalizePath(toAppPath(url.pathname));
  const target = `${toBrowserPath(appPath)}${url.search}`;
  const current = `${location.pathname}${location.search}`;
  if (current === target) return;

  history.pushState(null, "", target);
  if (!silent) {
    window.dispatchEvent(new Event("route-change"));
  }
};

export const initRouter = (renderFn) => {
  const handleRouteChange = () => renderFn();
  const handleLinkClick = (e) => {
    const element = e.target.closest("[data-link]");
    if (!element) return;
    e.preventDefault();
    const path = element.getAttribute("href") ?? element.getAttribute("data-link");
    if (path) {
      push(path);
    }
  };

  handleRouteChange();
  window.addEventListener("route-change", handleRouteChange);
  window.addEventListener("popstate", handleRouteChange);
  document.body.addEventListener("click", handleLinkClick);
};
