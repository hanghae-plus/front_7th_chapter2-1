import { createRouter } from "@core/router";
import { ProductListPage } from "./product/list";
import { ProductDetailPage } from "./product/detail";

export const routes = {
  쇼핑몰: {
    path: "/",
    component: ProductListPage,
  },
  "상품 상세": {
    path: "/product/:id",
    component: ProductDetailPage,
  },
} as const;

export type Routes = typeof routes;

export const { Router, useRouter } = createRouter(routes);
