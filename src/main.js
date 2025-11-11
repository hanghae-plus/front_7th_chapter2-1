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
  document.body.addEventListener("change", (e) => {
    // limit 변경
    if (e.target.id === "limit-select") {
      const limit = e.target.value;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        limit,
        current: 1,
      });
    }

    // sort 변경
    if (e.target.id === "sort-select") {
      const sort = e.target.value;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        sort,
        current: 1,
      });
    }
  });

  // 검색어 입력 (엔터키)
  document.body.addEventListener("keypress", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      const search = e.target.value;
      const currentParams = router.getQueryParams();
      router.pushWithQuery("/", {
        ...currentParams,
        search,
        page: 1,
      });
    }
  });
};

const main = () => {
  initEventListeners();
  router.init();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
