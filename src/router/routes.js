import { getProduct } from "../api/productApi.js";
import { DetailPage } from "../pages/DetailPAge.js";
import { HomePage } from "../pages/Homepage.js";

export const setupRoutes = (router) => {
  router
    .addRoute("/", async () => {
      return HomePage();
    })
    .addRoute("/products/:id", async (params) => {
      const data = await getProduct(params.id);
      return DetailPage({ loading: false, product: data });
    });

  return router;
};
