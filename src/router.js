import Cart from "./pages/Cart";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Product from "./pages/Product";

const root = document.querySelector("#root");

const routes = [
  { path: "/", page: Home },
  { path: "/products", page: Product },
  { path: "/cart", page: Cart },
];

const getRoute = (path) => {
  const route = routes.find((r) => r.path === path);
  return route;
};

const render = (path) => {
  const route = getRoute(path);
  const page = route?.page || NotFound;

  const view = page();

  if (view instanceof Node) root.replaceChildren(view);
  else root.innerHTML = view ?? "";
};

export const navigate = (path, param) => {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", window.location.origin + path);
  return render(path, param);
};

export const initailizeRouter = () => {
  window.addEventListener("popstate", () => render(window.location.pathname));
  render("/");
};
