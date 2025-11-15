import { router } from "./core/router.js";
import { render } from "./core/render.js";
import { store } from "./core/store.js";
import { HomePage, DetailPage, NotFoundPage } from "./pages/index.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`, // base 경로 추가
      },
      onUnhandledRequest: "bypass",
    }),
  );

const main = () => {
  store.initCart();

  router.setup({
    "/": {
      page: HomePage,
    },
    "/product/:id": {
      page: DetailPage,
    },
    "*": {
      page: NotFoundPage,
    },
  });

  // 라우터 변경 시에만 렌더링
  router.subscribe(render);
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
