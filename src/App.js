import { createRouter } from "./core/router";
import { DetailPage } from "./pages/DetailPage";
import { HomePage } from "./pages/HomePage";

export const router = createRouter([
  {
    path: "/",
    element: HomePage,
  },
  {
    path: "/product/:id",
    element: DetailPage,
  },
]);

export const App = () => {
  router.initRouter();
};
