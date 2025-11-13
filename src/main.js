import Home from "@pages/Home.js";
import { initRouter } from "@/core/Router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

const main = () => {
  // router 초기화
  initRouter([{ path: "/", page: Home }, { path: "/product", page: null }, { path: "/product/:productId" }]);
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
