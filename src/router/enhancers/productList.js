import { eventBus } from "../../utils/EventBus.js";

const bindProductListObserver = () => {
  const root = document.querySelector("#root");
  if (!root) {
    return () => {};
  }

  const sentinel = root.querySelector("[data-infinite-trigger]");
  if (!sentinel) {
    return () => {};
  }

  const handleClick = (event) => {
    const retryButton = event.target.closest("[data-infinite-retry]");
    if (!retryButton) {
      return;
    }

    sentinel.dataset.loading = "true";
    sentinel.innerHTML = `<span class="text-xs text-gray-500">상품을 불러오는 중...</span>`;
    eventBus.emit("products:loadMore");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const hasNext = sentinel.dataset.hasNext !== "false";
        const isLoading = sentinel.dataset.loading === "true";

        if (!hasNext || isLoading) {
          return;
        }

        sentinel.dataset.loading = "true";
        sentinel.innerHTML = `<span class="text-xs text-gray-500">상품을 불러오는 중...</span>`;
        eventBus.emit("products:loadMore");
      });
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "200px 0px",
    },
  );

  sentinel.addEventListener("click", handleClick);
  observer.observe(sentinel);

  return () => {
    observer.disconnect();
    sentinel.removeEventListener("click", handleClick);
  };
};

export const attachProductListEnhancer = (router) => {
  let cleanup = () => {};

  const rebind = () => {
    cleanup();
    cleanup = bindProductListObserver();
  };

  router.subscribe(rebind);
};
