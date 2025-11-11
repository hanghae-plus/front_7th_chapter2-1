import { getProduct, getProducts } from "../api/productApi.js";
import { DetailPage } from "../pages/DetailPAge.js";
import { HomePage } from "../pages/Homepage.js";

export const setupRoutes = (router) => {
  router
    .addRoute("/", async () => {
      const queryParams = router.getQueryParams();

      const params = {
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 20,
        search: queryParams.search || "",
        category1: queryParams.category1 || "",
        category2: queryParams.category2 || "",
        sort: queryParams.sort || "price_asc",
      };

      const data = await getProducts(params);
      console.log(data);
      return HomePage({
        ...data,
        loading: false,
        filters: params, // 현재 필터 상태 전달
      });
    })
    .addRoute("/products/:id", async (params) => {
      const data = await getProduct(params.id);
      return DetailPage({ loading: false, product: data });
    });

  return router;
};
