import { createRouter } from "./core/router";
import { createStore } from "./core/store";
import { DetailPage } from "./pages/DetailPage";
import { HomePage } from "./pages/HomePage";

const state = createStore({
  loading: true,
  categories: {},
  limit: 20,
  search: "",
});

export const router = createRouter(
  [
    {
      path: "/",
      element: HomePage,
    },
    {
      path: "/product/:id",
      element: DetailPage,
    },
  ],
  state,
);

export const App = () => {
  router.initRouter();
};
