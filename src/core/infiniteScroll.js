// 무한 스크롤 기능 (Intersection Observer 사용)
export const createInfiniteScroll = ({ onLoadMore, rootMargin = "100px" }) => {
  let isLoading = false;
  let hasMore = true;
  let observer = null;
  let sentinel = null;

  const createSentinel = () => {
    // 감시 대상 요소 생성
    const element = document.createElement("div");
    element.id = "infinite-scroll-sentinel";
    element.style.height = "1px";
    return element;
  };

  const handleIntersect = (entries) => {
    const entry = entries[0];

    if (entry.isIntersecting && !isLoading && hasMore) {
      isLoading = true;
      onLoadMore()
        .then(() => {
          isLoading = false;
        })
        .catch((error) => {
          isLoading = false;
          console.error("무한 스크롤 로드 실패:", error);
        });
    }
  };

  const start = () => {
    // 기존 observer 정리
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // 기존 sentinel 제거
    if (sentinel) {
      sentinel.remove();
      sentinel = null;
    }

    // 새 sentinel 생성 및 추가
    sentinel = createSentinel();
    const productsGrid = document.querySelector("#products-grid");

    if (productsGrid && productsGrid.parentElement) {
      // 상품 그리드 다음에 sentinel 추가
      productsGrid.parentElement.appendChild(sentinel);

      // Intersection Observer 생성
      observer = new IntersectionObserver(handleIntersect, {
        root: null,
        rootMargin,
        threshold: 0,
      });

      observer.observe(sentinel);
    }
  };

  const stop = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (sentinel) {
      sentinel.remove();
      sentinel = null;
    }
  };

  const updateStatus = ({ hasMore: newHasMore }) => {
    hasMore = newHasMore;
  };

  return { start, stop, updateStatus };
};
