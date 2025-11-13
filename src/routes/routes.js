import { NotFoundPage } from "../pages/not-found/NotFoundPage";
import { HomePage } from "../pages/home/HomePage";
import { ProductDetailPage } from "../pages/product-detail/ProductDetailPage";
import { MainLayout } from "../components/layout/MainLayout";
import { DetailLayout } from "../components/layout/DetailLayout";

export const routes = [
  { path: "/", component: HomePage, layout: MainLayout },
  { path: "/product/:productId", component: ProductDetailPage, layout: DetailLayout },
  { path: "/*", component: NotFoundPage, layout: MainLayout },
];
