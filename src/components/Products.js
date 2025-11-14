import { getProducts } from "../api/productApi";
import router from "../Router.js";
import { store } from "../store/Store.js";
import InfiniteScrollLoader from "./InfiniteScrollLoader.js";

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

    // 카테고리 및 limit 변경 시 상품 목록 다시 조회
    store.subscribe("selectedCategory1", onFilterChange);
    store.subscribe("selectedCategory2", onFilterChange);
    store.subscribe("selectedLimit", onFilterChange);
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

      if (productCard) {
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

      const data = await getProducts({
        page,
        limit: parseInt(limit),
        category1: category1 || "",
        category2: category2 || "",
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
