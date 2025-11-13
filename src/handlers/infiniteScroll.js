import { getProducts } from "../api/productApi.js";
import { ProductItem } from "../components/products/productList/ProductItem.js";
import { router } from "../App";
import { cartState } from "../App";
import { showToast } from "./toast";

let infiniteScrollObserver = null;
let isLoading = false;

/**
 * 새로 추가된 상품에만 이벤트 핸들러 연결
 * @param {Array} products - 새로 추가된 상품 배열
 */
function attachEventHandlersToNewProducts(products) {
  if (!products || products.length === 0) return;

  const productIds = products.map((p) => p.productId);

  // 새로 추가된 상품 카드만 선택
  productIds.forEach((productId) => {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productCard) return;

    // 상품 클릭 이벤트 (이미지, 정보 영역)
    const productImage = productCard.querySelector(".product-image");
    const productInfo = productCard.querySelector(".product-info");
    [productImage, productInfo].forEach((element) => {
      if (element && !element.dataset.listenerAttached) {
        element.dataset.listenerAttached = "true";
        element.addEventListener("click", () => {
          router.navigateTo(`/product/${productId}`);
        });
      }
    });

    // 장바구니 버튼 클릭 이벤트
    const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
    if (addToCartBtn && !addToCartBtn.dataset.listenerAttached) {
      addToCartBtn.dataset.listenerAttached = "true";
      addToCartBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        const product = products.find((p) => p.productId === productId);
        if (!product) return;

        const currentItems = cartState.getState().items || [];
        const existingItem = currentItems.find((item) => item.productId === productId);

        if (existingItem) {
          cartState.setState({
            items: currentItems.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
            ),
          });
        } else {
          cartState.setState({
            items: [
              ...currentItems,
              {
                productId,
                quantity: 1,
                title: product.title,
                image: product.image,
                lprice: product.lprice,
              },
            ],
          });
        }

        showToast();
      });
    }
  });
}

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

          // 현재 상태 가져오기
          const state = router.getState ? router.getState() : {};
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
              limit: parseInt(urlParams.get("limit")) || state.limit || 20,
              search: urlParams.get("search") || state.search || "",
              category1: urlParams.get("category1") || state.category1 || "",
              category2: urlParams.get("category2") || state.category2 || "",
              current: nextPage,
              sort: urlParams.get("sort") || state.sort || "price_asc",
            });

            // 상품 목록에 추가 (전체 리렌더링 없이 추가만)
            if (productsGrid && productsData.products && productsData.products.length > 0) {
              const newProductsHTML = productsData.products.map((product) => ProductItem({ product })).join("");
              productsGrid.insertAdjacentHTML("beforeend", newProductsHTML);

              // 새로 추가된 상품에만 이벤트 핸들러 연결
              attachEventHandlersToNewProducts(productsData.products);
            }

            // URL 업데이트 (히스토리만, 페이지 리로드 없이)
            urlParams.set("current", String(nextPage));
            const newUrl = `/?${urlParams.toString()}`;
            window.history.pushState({}, "", newUrl);

            // 상태 업데이트 (라우터 상태와 동기화)
            if (router.updateState) {
              router.updateState({ current: nextPage });
            }

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
