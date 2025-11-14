import { getProducts } from "../api/productApi";
import router from "../Router.js";
import { store } from "../store/Store.js";
import InfiniteScrollLoader from "./InfiniteScrollLoader.js";

// 토스트 메시지 표시 함수
const showToast = (message, type = "success") => {
  // 애니메이션 스타일 추가 (한 번만)
  if (!document.getElementById("toast-animations")) {
    const style = document.createElement("style");
    style.id = "toast-animations";
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
      @keyframes slideUp {
        from {
          transform: translate(-50%, 0);
          opacity: 1;
        }
        to {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 기존 토스트 제거
  const existingToast = document.getElementById("toast-container");
  if (existingToast) {
    existingToast.remove();
  }

  // 토스트 컨테이너 생성
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50";
  toastContainer.style.animation = "slideDown 0.3s ease-out";

  // 타입에 따른 스타일 설정
  let bgColor, icon;
  if (type === "success") {
    bgColor = "bg-green-600";
    icon = /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    `;
  } else if (type === "error") {
    bgColor = "bg-red-600";
    icon = /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
  } else {
    bgColor = "bg-blue-600";
    icon = /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    `;
  }

  toastContainer.innerHTML = /* HTML */ `
    <div class="flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
      <div class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        <div class="flex-shrink-0">${icon}</div>
        <p class="text-sm font-medium">${message}</p>
        <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(toastContainer);

  // 닫기 버튼 이벤트
  const closeBtn = toastContainer.querySelector("#toast-close-btn");
  closeBtn.addEventListener("click", () => {
    toastContainer.remove();
  });

  // 3초 후 자동 제거
  setTimeout(() => {
    if (toastContainer.parentElement) {
      toastContainer.style.animation = "slideUp 0.3s ease-in";
      setTimeout(() => {
        toastContainer.remove();
      }, 300);
    }
  }, 3000);
};

const Products = (targetNode) => {
  let currentPage = 1;
  let isLoadingMore = false;
  let hasNextPage = false;
  let observerInstance = null;

  const registerStore = () => {
    store.subscribe("isProductListLoading", onUpdate);
    store.setState("isProductListLoading", true);
    store.subscribe("productsData", onUpdate);
    store.setState("productsData", null);

    // 카테고리, limit, sort, search 변경 시 상품 목록 다시 조회
    store.subscribe("selectedCategory1", onFilterChange);
    store.subscribe("selectedCategory2", onFilterChange);
    store.subscribe("selectedLimit", onFilterChange);
    store.subscribe("selectedSort", onFilterChange);
    store.subscribe("searchKeyword", onFilterChange);
  };

  const render = () => {
    const isProductListLoading = store.getState("isProductListLoading");
    const data = store.getState("productsData");

    const ProductCard = (product) => {
      const { brand, image, lprice, productId, title } = product;
      return /* HTML */ `
        <div
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
          data-product-id="${productId}"
        >
          <!-- 상품 이미지 -->
          <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
            <img
              src="${image}"
              alt="${title}"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          </div>
          <!-- 상품 정보 -->
          <div class="p-3">
            <div class="cursor-pointer product-info mb-3">
              <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${title}</h3>
              <p class="text-xs text-gray-500 mb-2">${brand ?? ""}</p>
              <p class="text-lg font-bold text-gray-900">${Number(lprice).toLocaleString()}원</p>
            </div>
            <!-- 장바구니 버튼 -->
            <button
              class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn"
              data-product-id="${productId}"
            >
              장바구니 담기
            </button>
          </div>
        </div>
      `;
    };

    // 페이지네이션 정보 업데이트
    if (data?.pagination) {
      hasNextPage = data.pagination.hasNext;
    }

    targetNode.innerHTML = /* HTML */ `
      ${isProductListLoading
        ? Skeleton()
        : /* HTML */ `
            <div>
              <!-- 상품 개수 정보 -->
              <div class="mb-4 text-sm text-gray-600">
                총 <span class="font-medium text-gray-900">${data?.pagination?.total ?? 0}개</span>의 상품
              </div>
              <!-- 상품 그리드 -->
              <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                ${data?.products?.map((product) => ProductCard(product)).join("") ?? ""}
              </div>
              <!-- 무한 스크롤 트리거 -->
              ${hasNextPage
                ? /* HTML */ `<div id="scroll-trigger" class="h-4">${isLoadingMore ? InfiniteScrollLoader() : ""}</div>`
                : /* HTML */ `<div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>`}
            </div>
          `}
    `;
  };

  const onUpdate = () => {
    render();
    addEventListeners();

    if (observerInstance) {
      observerInstance.disconnect();
    }

    if (hasNextPage) {
      setupInfiniteScroll();
    }
  };

  const onFilterChange = () => {
    // 필터 변경 시 첫 페이지부터 다시 조회
    store.setState("isProductListLoading", true);
    currentPage = 1;
    fetchProducts(1);
  };

  const addEventListeners = () => {
    const $productsGrid = document.getElementById("products-grid");

    if (!$productsGrid) return;

    $productsGrid.addEventListener("click", (ev) => {
      const productCard = ev.target.closest(".product-card");
      const addToCartBtn = ev.target.closest(".add-to-cart-btn");
      const productImage = ev.target.closest(".product-image");
      const productInfo = ev.target.closest(".product-info");

      // 장바구니 담기 버튼 클릭
      if (addToCartBtn) {
        ev.stopPropagation();
        const productId = addToCartBtn.dataset.productId;

        // 현재 상품 목록에서 해당 상품 찾기
        const productsData = store.getState("productsData");
        const product = productsData?.products?.find((p) => p.productId === productId);

        if (!product) return;

        try {
          // localStorage에서 기존 장바구니 데이터 가져오기
          const cartData = localStorage.getItem("shopping_cart");
          let cart = cartData ? JSON.parse(cartData) : { items: [], selectedAll: false };

          // 기존에 같은 상품이 있는지 확인
          const existingItemIndex = cart.items.findIndex((item) => item.id === product.productId);

          if (existingItemIndex > -1) {
            // 기존 상품이 있으면 수량 증가
            cart.items[existingItemIndex].quantity += 1;
          } else {
            // 새로운 상품 추가 (수량 1)
            cart.items.push({
              id: product.productId,
              title: product.title,
              image: product.image,
              price: product.lprice,
              quantity: 1,
              selected: false,
            });
          }

          // localStorage에 저장
          localStorage.setItem("shopping_cart", JSON.stringify(cart));

          // 사용자에게 토스트 메시지 표시
          showToast("장바구니에 추가되었습니다.", "success");

          // Header 업데이트
          window.dispatchEvent(new Event("storage"));
        } catch (error) {
          console.error("장바구니 저장 실패:", error);
          showToast("장바구니에 담는 중 오류가 발생했습니다.", "error");
        }
        return;
      }

      // 상품 카드 클릭 (상세 페이지 이동)
      if (productCard && (productImage || productInfo)) {
        const productId = productCard.dataset.productId;
        router.push(`${import.meta.env.BASE_URL}product/${productId}`);
      }
    });
  };

  const fetchProducts = async (page = 1) => {
    try {
      const category1 = store.getState("selectedCategory1");
      const category2 = store.getState("selectedCategory2");
      const limit = store.getState("selectedLimit") || "20";
      const sort = store.getState("selectedSort") || "price_asc";
      const search = store.getState("searchKeyword") || "";

      const data = await getProducts({
        page,
        limit: parseInt(limit),
        category1: category1 || "",
        category2: category2 || "",
        sort,
        search,
      });

      if (page === 1) {
        // 첫 페이지는 교체
        currentPage = 1;
        store.setState("productsData", data);
      } else {
        // 다음 페이지는 기존 데이터에 추가
        const existingData = store.getState("productsData");
        store.setState("productsData", {
          ...data,
          products: [...(existingData?.products || []), ...data.products],
        });
        currentPage = page;
      }
    } catch (error) {
      console.error(error);
    } finally {
      store.setState("isProductListLoading", false);
      isLoadingMore = false;
    }
  };

  const loadNextPage = async () => {
    if (isLoadingMore || !hasNextPage) return;

    isLoadingMore = true;
    render(); // 로딩 UI 표시

    await fetchProducts(currentPage + 1);
  };

  const setupInfiniteScroll = () => {
    const trigger = document.getElementById("scroll-trigger");
    if (!trigger) return;

    observerInstance = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isLoadingMore) {
            loadNextPage();
          }
        });
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    observerInstance.observe(trigger);
  };

  const didMount = () => {
    addEventListeners();
    fetchProducts();
  };

  const onMount = () => {
    registerStore();
    render();
    didMount();
  };

  onMount();
};

export default Products;

const Skeleton = () => {
  return (
    /* HTML */
    `
      <div>
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          ${Array.from({ length: 6 })
            .map(() => {
              return (
                /* HTML */
                `
                  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div class="aspect-square bg-gray-200"></div>
                    <div class="p-3">
                      <div class="h-4 bg-gray-200 rounded mb-2"></div>
                      <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div class="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                `
              );
            })
            .join("")}
        </div>
      </div>
    `
  );
};
