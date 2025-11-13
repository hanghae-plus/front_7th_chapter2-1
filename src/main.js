import Home from "@pages/Home.js";
import { initRouter } from "@/core/Router.js";
import Product from "@/pages/Product.js";
import Error from "@/pages/Error.js";

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
  // MSW가 준비된 후에 router 초기화 및 페이지 렌더링
  initRouter([
    { path: "/", page: Home },
    { path: "/product", page: Product },
    { path: "/product/:productId", page: Product },
    { path: "/404", page: Error },
    { path: "/*", page: Error },
  ]);
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
