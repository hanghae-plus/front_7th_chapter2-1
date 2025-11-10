import { router } from "./router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

document.body.addEventListener("click", (e) => {
  if (e.target.closest(".product-card")) {
    const productId = e.target.closest(".product-card").dataset.productId;
    router.push(`/products/${productId}`);
    router();
  }
});

router.init();

async function main() {
  router();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
