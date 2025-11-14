import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import { pathToRegex } from "./utils/route";
import NotFoundPage from "./pages/NotFoundPage";

/** @typedef {import('./types.js').HomePageProps} HomePageProps */
/** @typedef {import('./types.js').ProductDetailPageProps} ProductDetailPageProps */

export const ROUTES = Object.freeze({
  home: {
    name: "home",
    path: "/",
    pattern: pathToRegex("/"),
    render: HomePage.mount,
  },
  productDetail: {
    name: "productDetail",
    path: "/product/:id",
    pattern: pathToRegex("/product/:id"),
    render: ProductDetailPage.mount,
  },
  notFound: {
    name: "notFound",
    path: "/404",
    pattern: pathToRegex("/404"),
    render: NotFoundPage.mount,
  },
});
