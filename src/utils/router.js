import { CartPage } from "../pages/CartPage";
import { DetailPage } from "../pages/DetailPage";
import { HomePage } from "../pages/HomePage";

const routes = [
  { path: "/", component: HomePage },
  { path: "/cart", component: CartPage },
  { path: "/products/:id", component: DetailPage },
];

const pathToRegex = (path) => {
  // '/products/:id' → '/products/([^/]+)'
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

export const push = (path) => {
  history.pushState(null, null, path);

  // 화면 다시 그리기
  // main.js의 render() 함수가 호출되어야 함
  window.dispatchEvent(new Event("route-change"));
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
