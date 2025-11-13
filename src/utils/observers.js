import { state } from "../state/appState.js";

let loadMoreObserver = null;

/**
 * 무한 스크롤 옵저버를 설정합니다.
 * @param {HTMLElement} rootElement - 루트 요소
 * @param {Function} onLoadMore - 더보기 로드 함수
 */
export function setupLoadMoreObserver(rootElement, onLoadMore) {
  if (state.route?.name !== "home") {
    disconnectLoadMoreObserver();
    return;
  }

  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
    loadMoreObserver = null;
  }

  if (state.loadMoreError) {
    return;
  }

  const sentinel = rootElement.querySelector("#products-load-more-trigger");
  if (!sentinel) {
    return;
  }

  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (onLoadMore) {
            onLoadMore();
          }
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0,
    },
  );

  loadMoreObserver.observe(sentinel);
}

/**
 * 무한 스크롤 옵저버를 해제합니다.
 */
export function disconnectLoadMoreObserver() {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
    loadMoreObserver = null;
  }
}
