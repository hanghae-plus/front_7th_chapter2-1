import { DetailPage } from "../pages/DetailPage.js";
import { HomePage } from "../pages/HomePage.js";

export const setupRoutes = (router) => {
  router.addRoute("/", async () => {
    return HomePage();
  });
  router.addRoute("/product/:id", async (params) => {
    return DetailPage(params);
  });

  return router;
};
