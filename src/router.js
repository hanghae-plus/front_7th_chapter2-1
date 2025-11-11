import HomePage from "@/pages/HomePage";
import CartPage from "@/pages/CartPage";
import ProductPage from "@/pages/ProductPage";
import NotFound from "@/pages/NotFound";

const root = document.querySelector("#root");
let currentPageComponent = null; // 현재 페이지 컴포넌트 추적

const routes = [
  { path: "/", component: HomePage },
  { path: "/cart", component: CartPage },
  { path: "/products/:id", component: ProductPage },
];

const pathToRegex = (path) => new RegExp(`^${path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)")}$`);

export const getMatch = (path) => {
  const matchedRoutes = routes.map((route) => {
    return { route, isMatch: path.match(pathToRegex(route.path)) };
  });
  return matchedRoutes.find((matchedRoute) => matchedRoute.isMatch !== null);
};

export const render = (path, param) => {
  // 이전 페이지 컴포넌트 unmount
  if (currentPageComponent && typeof currentPageComponent.unmount === "function") {
    currentPageComponent.unmount();
  }

  const match = getMatch(path);
  const newComponent = match ? new match.route.component(root, param) : new NotFound(root);

  // 새로운 페이지 컴포넌트 저장
  currentPageComponent = newComponent;

  return newComponent;
};

export const navigateTo = (path, param) => {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", window.location.origin + path);
    return render(path, param);
  }
};

export const initailizeRouter = () => {
  window.addEventListener("popstate", () => render(window.location.pathname));
  const currentPath = window.location.pathname;
  render(currentPath);
};
