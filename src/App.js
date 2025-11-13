import { createRouter } from "./core/router";
import { createStore } from "./core/store";
import { attachDetailPageHandlers, attachHomePageEventListeners } from "./handlers";
import { DetailPage } from "./pages/DetailPage";
import { HomePage } from "./pages/HomePage";

const state = createStore({
  loading: true,
  categories: {},
  limit: 20,
  search: "",
  category1: "",
  category2: "",
  current: 1,
  sort: "price_asc",
});

export const cartState = createStore({
  items: [],
});

export const router = createRouter(
  [
    {
      path: "/",
      element: HomePage,
      attachHandlers: attachHomePageEventListeners,
    },
    {
      path: "/product/:id",
      element: DetailPage,
      attachHandlers: attachDetailPageHandlers,
    },
  ],
  state,
);

export const App = () => {
  router.initRouter();
};
