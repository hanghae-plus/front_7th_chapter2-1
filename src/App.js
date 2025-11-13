import { createRouter } from "./core/router";
import { createStore } from "./core/store";
import { DetailPage } from "./pages/DetailPage";
import { HomePage } from "./pages/HomePage";
import { getCartStateFromStorage, saveCartStateToStorage } from "./utils/storage";

// localStorage에서 cartState 복원하여 초기화
export const cartState = createStore(getCartStateFromStorage());

// cartState 변경 시 localStorage에 저장
cartState.subscribe((state) => {
  saveCartStateToStorage(state);
});

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
