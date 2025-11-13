import { createRouter } from "./core/router";
import { createStore } from "./core/store";
import { attachDetailPageHandlers, attachHomePageEventListeners } from "./handlers";
import { DetailPage } from "./pages/DetailPage";
import { HomePage } from "./pages/HomePage";
import { getCartStateFromStorage, saveCartStateToStorage } from "./utils/storage";

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

// localStorage에서 cartState 복원하여 초기화
export const cartState = createStore(getCartStateFromStorage());

// cartState 변경 시 localStorage에 저장
cartState.subscribe((state) => {
  saveCartStateToStorage(state);
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
