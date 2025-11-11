import { router } from "./core/router.js";
import { store } from "./core/store.js";
import { render, onBeforeRender, onAfterRender } from "./core/render.js";
import { HomePage, DetailPage, NotFoundPage } from "./pages/index.js";

onBeforeRender(() => {
  console.log("before render");
});

onAfterRender(() => {
  console.log("after render");
});

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

const main = () => {
  router.setup({
    "/": {
      component: HomePage,
      onEnter: () => {
        store.fetchProducts();
      },
    },
    "/products/:id": {
      component: DetailPage,
      onEnter: (props) => {
        store.fetchProductDetail(props.productId);
      },
    },
    "*": {
      component: NotFoundPage,
    },
  });
  // 상태 변경시 렌더
  store.subscribe(render);
  router.subscribe(render);
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
