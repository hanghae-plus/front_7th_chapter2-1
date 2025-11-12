import { NotFoundPage } from "../pages/not-found/NotFoundPage";
import { HomePage } from "../pages/home/HomePage";
import { ProductDetailPage } from "../pages/product-detail/ProductDetailPage";

export const routes = [
  { path: "/", component: HomePage },
  { path: "/product/:id", component: ProductDetailPage },
  { path: "/*", component: NotFoundPage },
];
