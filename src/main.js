import { router } from "./router/index.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );

// 이벤트 리스너
const initEventListeners = () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".product-card")) {
      e.preventDefault();
      const productId = e.target.closest(".product-card").dataset.productId;
      router.push(`/products/${productId}`);
    }

    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const href = link.getAttribute("href");
      router.push(href);
    }
  });
};

const main = () => {
  initEventListeners();
  router.init();
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
