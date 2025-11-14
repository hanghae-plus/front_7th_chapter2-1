import { ProductDetail } from "./pages/product/productDetail.js";
import { Home } from "./pages/productList/home.js";

export const routes = {
  "/": Home,
  "/product/:id": ProductDetail,
};
