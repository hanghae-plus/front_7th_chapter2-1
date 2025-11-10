import { initRouter } from "./router/index.js";
import { HomePage } from "./pages/HomePage.js";
import { setupHomePageHandlers } from "./handlers/homeHandlers.js";
import { DetailPage } from "./pages/DetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

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
const routes = [
  { path: "/", component: HomePage, setupHandlers: setupHomePageHandlers },
  { path: "/product/:id", component: DetailPage },
  { path: "*", component: NotFoundPage },
];

async function main() {
  // 라우터 초기화
  const router = initRouter(routes);

  // 전역에서 사용할 수 있도록 window 객체에 추가
  window.router = router;
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
