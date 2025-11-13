import { initRouter } from "./router/index.js";
import { HomePage } from "./pages/HomePage.js";
import { setupHomePageHandlers } from "./handlers/homeHandlers.js";
import { DetailPage } from "./pages/DetailPage.js";
import { setupDetailPageHandlers } from "./handlers/detailHandlers.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { setupCartHandlers } from "./handlers/cartHandlers.js";
import { subscribeCartChange } from "./utils/cartStorage.js";
import { updateCartIconCount } from "./components/common/Header.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: import.meta.env.BASE_URL + "mockServiceWorker.js",
      },
    }),
  );

// 라우트 설정
export const routes = [
  { path: "/", component: HomePage, setupHandlers: setupHomePageHandlers },
  { path: "/product/:id", component: DetailPage, setupHandlers: setupDetailPageHandlers },
  { path: "*", component: NotFoundPage },
];

async function main() {
  // 1. 라우터 초기화
  const router = initRouter(routes);
  window.router = router;

  // 2. 장바구니 변경 구독 - 자동으로 아이콘 업데이트
  subscribeCartChange(updateCartIconCount);

  // 3. 장바구니 핸들러 등록 (모달 열기/닫기 + 아이템 조작)
  setupCartHandlers();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
