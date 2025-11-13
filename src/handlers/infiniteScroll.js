import { getProducts } from "../api/productApi.js";
import { ProductItem } from "../components/products/productList/ProductItem.js";

let infiniteScrollObserver = null;
let isLoading = false;

export function setUpInfiniteScroll() {
  // 기존 Observer 제거
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect();
    infiniteScrollObserver = null;
  }

  // 로딩 완료 후 플래그 리셋
  isLoading = false;

  const sentinel = document.querySelector("#infinite-scroll-sentinel");
  if (!sentinel) {
    return; // 마지막 페이지
  }

  infiniteScrollObserver = new IntersectionObserver(
    async (entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting && !isLoading) {
          isLoading = true;

          // URL에서 현재 상태 가져오기
          const urlParams = new URLSearchParams(window.location.search);
          const currentPage = parseInt(urlParams.get("current")) || 1;
          const nextPage = currentPage + 1;

          // Observer 제거
          infiniteScrollObserver.disconnect();
          infiniteScrollObserver = null;

          // 로딩 인디케이터 표시
          const productsGrid = document.querySelector("#products-grid");
          if (productsGrid) {
            const loadingIndicator = document.createElement("div");
            loadingIndicator.className = "text-center py-4 text-gray-600";
            loadingIndicator.id = "infinite-scroll-loading";
            loadingIndicator.textContent = "상품을 불러오는 중...";
            productsGrid.parentElement.insertBefore(loadingIndicator, sentinel);
          }

          try {
            // 다음 페이지 데이터 로드
            const productsData = await getProducts({
              limit: parseInt(urlParams.get("limit")) || 20,
              search: urlParams.get("search") || "",
              category1: urlParams.get("category1") || "",
              category2: urlParams.get("category2") || "",
              current: nextPage,
              sort: urlParams.get("sort") || "price_asc",
            });

            // 상품 목록에 추가 (전체 리렌더링 없이 추가만)
            // 이벤트 위임 방식이므로 새로 추가된 상품에도 자동으로 이벤트가 적용됨
            if (productsGrid && productsData.products && productsData.products.length > 0) {
              const newProductsHTML = productsData.products.map((product) => ProductItem({ product })).join("");
              productsGrid.insertAdjacentHTML("beforeend", newProductsHTML);
            }

            // URL 업데이트 (히스토리만, 페이지 리로드 없이)
            urlParams.set("current", String(nextPage));
            const newUrl = `/?${urlParams.toString()}`;
            window.history.pushState({}, "", newUrl);

            // 로딩 인디케이터 제거
            const loadingIndicator = document.getElementById("infinite-scroll-loading");
            if (loadingIndicator) {
              loadingIndicator.remove();
            }

            // sentinel 제거 (마지막 페이지인 경우)
            if (productsData.pagination && productsData.pagination.page >= productsData.pagination.totalPages) {
              if (sentinel) {
                sentinel.remove();
              }
            } else {
              // 다음 페이지를 위해 Observer 다시 설정
              setUpInfiniteScroll();
            }
          } catch (error) {
            console.error("Failed to load more products:", error);
            const loadingIndicator = document.getElementById("infinite-scroll-loading");
            if (loadingIndicator) {
              loadingIndicator.textContent = "상품을 불러오는데 실패했습니다.";
            }
            // 실패해도 Observer 다시 설정
            setUpInfiniteScroll();
          }
        }
      });
    },
    {
      rootMargin: "20px",
      threshold: 0.5,
    },
  );

  infiniteScrollObserver.observe(sentinel);
}
