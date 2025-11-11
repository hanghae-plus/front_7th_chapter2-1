import { getProduct, getProducts } from "../api/productApi.js";
import { DetailPage } from "../pages/DetailPAge.js";
import { HomePage } from "../pages/Homepage.js";

export const setupRoutes = (router) => {
  router
    .addRoute("/", async () => {
      const data = await getProducts();
      return HomePage({ ...data, loading: false });
    })
    .addRoute("/products/:id", async (params) => {
      const data = await getProduct(params.id);
      return DetailPage({ loading: false, product: data });
    });

  return router;
};
