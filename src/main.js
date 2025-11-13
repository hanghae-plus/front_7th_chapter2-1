import { router } from "./core/router.js";
import { render } from "./core/render.js";
import { HomePage, DetailPage, NotFoundPage } from "./pages/index.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const main = () => {
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

  // store 구독은 각 페이지에서 개별적으로 관리!
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
