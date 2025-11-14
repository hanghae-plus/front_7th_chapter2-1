import { AddToCartBtn } from "../components/cart/addToCartBtn.js";
import { router } from "../router.js";

const ProductListStatus = (isLoading = true, hasMore = false) => {
  if (isLoading) {
    return /*html*/ `
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
      </div>
    `;
  }

  // 더 불러올 데이터가 없을 때만 완료 메시지 표시
  if (!hasMore) {
    return /*html*/ `
      <span class="text-sm text-gray-600">모든 상품을 확인했습니다</span>
    `;
  }

  // 더 불러올 데이터가 있으면 빈 상태 (Observer가 감지할 수 있도록)
  return /*html*/ ``;
};

const searchAndFilter = () => {
  return /*html*/ `
    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      <div class="mb-4">
        <div class="relative">
          <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        <div class="space-y-2">
          <div class="flex items-center gap-2" id="category-breadcrumb">
            <label class="text-sm text-gray-600">카테고리:</label>
            <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
          </div>
          <!-- 1depth 카테고리 -->
          <div class="flex flex-wrap gap-2" id="category1-container">
            <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
          </div>
          <!-- 2depth 카테고리 -->
        </div>
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            <select id="limit-select"
                    class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="10">
                10개
              </option>
              <option value="20" selected="">
                20개
              </option>
              <option value="50">
                50개
              </option>
              <option value="100">
                100개
              </option>
            </select>
          </div>
          <!-- 정렬 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>
            <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                        focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="price_asc" selected="">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
              <option value="name_asc">이름순</option>
              <option value="name_desc">이름 역순</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    `;
};

const itemSkeleton = () => {
  return /*html*/ `
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div class="aspect-square bg-gray-200"></div>
    <div class="p-3">
      <div class="h-4 bg-gray-200 rounded mb-2"></div>
      <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div class="h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
  `;
};

export const ItemListPage = (query = {}) => {
  let categoriesData = null;
  // URL 쿼리 파라미터에서 상태 복원
  let selectedCategory1 = query.category1 || null;
  let selectedCategory2 = query.category2 || null;
  let currentSearch = query.search || "";
  let currentSort = query.sort || "price_asc";
  let currentLimit = query.limit ? parseInt(query.limit) : 20;
  let currentPage = 1;
  let searchTimeout = null;
  // 무한 스크롤 관련 상태
  let isLoadingMore = false;
  let hasMore = true;
  let allProducts = [];
  let scrollObserver = null;

  // URL 쿼리 파라미터 업데이트 함수
  const updateURL = () => {
    const queryParams = {};
    if (currentSearch) queryParams.search = currentSearch;
    if (selectedCategory1) queryParams.category1 = selectedCategory1;
    if (selectedCategory2) queryParams.category2 = selectedCategory2;
    if (currentSort !== "price_asc") queryParams.sort = currentSort;
    if (currentLimit !== 20) queryParams.limit = currentLimit.toString();
    router.updateQuery(queryParams, true);
  };

  // 필터 리셋 및 상품 로드 공통 함수
  const resetAndLoadProducts = () => {
    currentPage = 1;
    hasMore = true;
    updateURL();
    loadProducts(false);
  };

  const updateBreadcrumb = () => {
    const breadcrumbContainer = document.getElementById("category-breadcrumb");
    if (!breadcrumbContainer) return;

    let breadcrumbHTML = `<label class="text-sm text-gray-600">카테고리:</label>`;
    breadcrumbHTML += `<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>`;

    if (selectedCategory1) {
      breadcrumbHTML += `<span class="text-xs text-gray-400">></span>`;
      breadcrumbHTML += `<button data-breadcrumb="category1" data-category1="${selectedCategory1}" class="text-xs hover:text-blue-800 hover:underline">${selectedCategory1}</button>`;

      if (selectedCategory2) {
        breadcrumbHTML += `<span class="text-xs text-gray-400">></span>`;
        breadcrumbHTML += `<span class="text-xs text-gray-700">${selectedCategory2}</span>`;
      }
    }

    breadcrumbContainer.innerHTML = breadcrumbHTML;
  };

  const setupCategoryEvents = () => {
    const breadcrumbContainer = document.getElementById("category-breadcrumb");
    const categoryContainer = document.getElementById("category1-container");

    // 브레드크럼 이벤트 위임 - 한 번만 등록
    if (breadcrumbContainer) {
      breadcrumbContainer.addEventListener("click", (e) => {
        const target = e.target;
        const breadcrumbType = target.getAttribute("data-breadcrumb");

        if (breadcrumbType === "reset") {
          selectedCategory1 = null;
          selectedCategory2 = null;
          updateBreadcrumb();
          renderCategory1Buttons();
          resetAndLoadProducts();
        } else if (breadcrumbType === "category1") {
          const category1 = target.getAttribute("data-category1");
          selectedCategory1 = category1;
          selectedCategory2 = null;
          updateBreadcrumb();
          renderCategory2Buttons(category1);
          resetAndLoadProducts();
        }
      });
    }

    // 카테고리 버튼 이벤트 위임 - 한 번만 등록
    if (categoryContainer) {
      categoryContainer.addEventListener("click", (e) => {
        const target = e.target.closest("button");
        if (!target) return;

        const category1 = target.getAttribute("data-category1");
        const category2 = target.getAttribute("data-category2");

        // 1depth 카테고리 버튼 클릭
        if (category1 && !category2) {
          selectedCategory1 = category1;
          selectedCategory2 = null;
          updateBreadcrumb();
          renderCategory2Buttons(category1);
          resetAndLoadProducts();
        }
        // 2depth 카테고리 버튼 클릭
        else if (category1 && category2) {
          selectedCategory1 = category1;
          selectedCategory2 = category2;
          updateBreadcrumb();
          resetAndLoadProducts();
        }
      });
    }
  };

  const renderCategory1Buttons = () => {
    const categoryContainer = document.getElementById("category1-container");
    if (!categoryContainer || !categoriesData) return;

    // 1depth 카테고리 버튼 생성
    const categoryButtons = Object.keys(categoriesData)
      .map(
        (category1) => `
        <button data-category1="${category1}" class="text-left px-3 py-2 text-sm rounded-md border transition-colors
           bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
          ${category1}
        </button>
      `,
      )
      .join("");

    categoryContainer.innerHTML = categoryButtons;
  };

  const renderCategory2Buttons = (category1) => {
    const categoryContainer = document.getElementById("category1-container");
    if (!categoryContainer || !categoriesData || !categoriesData[category1]) return;

    const category2List = Object.keys(categoriesData[category1]);

    // 2depth 카테고리 버튼 생성
    const categoryButtons = category2List
      .map(
        (category2) => `
        <button data-category1="${category1}" data-category2="${category2}" class="text-left px-3 py-2 text-sm rounded-md border transition-colors
           bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
          ${category2}
        </button>
      `,
      )
      .join("");

    categoryContainer.innerHTML = categoryButtons;
  };

  const updateProductListStatus = (isLoading) => {
    const statusContainer = document.getElementById("product-list-status");
    if (!statusContainer) return;

    // 최상위 div는 유지하고 내부 내용만 업데이트
    statusContainer.innerHTML = ProductListStatus(isLoading, hasMore);
  };

  const renderProducts = (products, total, isAppend = false) => {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    if (products.length === 0 && !isAppend) {
      productsGrid.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500">상품이 없습니다.</div>';
      updateProductListStatus(false);
      hasMore = false;
      return;
    }

    const productsHTML = products
      .map(
        (product) => /*html*/ `
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                data-product-id="${product.productId}">
            <!-- 상품 이미지 -->
            <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
              <img src="${product.image}"
                    alt="${product.title}"
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    loading="lazy">
            </div>
            <!-- 상품 정보 -->
            <div class="p-3">
              <div class="cursor-pointer product-info mb-3">
                <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  ${product.title}
                </h3>
                <p class="text-xs text-gray-500 mb-2">${product.brand || product.mallName || ""}</p>
                <p class="text-lg font-bold text-gray-900">
                  ${Number(product.lprice || product.price || 0).toLocaleString()}원
                </p>
              </div>
              <!-- 장바구니 버튼 -->
              ${AddToCartBtn(product, 1, "small")}
            </div>
          </div>
    `,
      )
      .join("");

    if (isAppend) {
      // 기존 목록에 추가
      productsGrid.insertAdjacentHTML("beforeend", productsHTML);
    } else {
      // 전체 교체
      productsGrid.innerHTML = productsHTML;
    }

    // 상품 개수 정보 업데이트
    const productCountInfo = document.getElementById("product-count-info");
    if (productCountInfo) {
      productCountInfo.innerHTML = `총 <span class="font-medium text-gray-900">${total}개</span>의 상품`;
    }

    // 상태 업데이트
    if (!isLoadingMore) {
      updateProductListStatus(false);
    }
  };

  const showLoading = () => {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    // 스켈레톤 UI 표시 (limit에 맞춰서, 최대 8개)
    const skeletonCount = Math.min(currentLimit, 8);
    productsGrid.innerHTML = Array(skeletonCount)
      .fill(0)
      .map(() => itemSkeleton())
      .join("");

    // 상태를 로딩 중으로 업데이트
    updateProductListStatus(true);
  };

  const loadProducts = async (isAppend = false) => {
    // 추가 로딩 중이면 중복 요청 방지
    if (isLoadingMore) return;

    if (!isAppend) {
      // 초기 로드
      showLoading();
      allProducts = [];
      hasMore = true;
    } else {
      // 추가 로드
      updateProductListStatus(true);
    }

    isLoadingMore = true;

    try {
      const { getProducts } = await import("../api/productApi.js");
      const response = await getProducts({
        page: currentPage,
        limit: currentLimit,
        search: currentSearch,
        category1: selectedCategory1 || "",
        category2: selectedCategory2 || "",
        sort: currentSort,
      });

      const newProducts = response.products || [];
      hasMore = response.pagination?.hasNext || false;

      if (isAppend) {
        // 기존 목록에 추가
        allProducts = [...allProducts, ...newProducts];
      } else {
        // 초기 로드
        allProducts = newProducts;
      }

      renderProducts(allProducts, response.pagination?.total || 0, isAppend);

      // 무한 스크롤 Observer 설정/재설정
      setupInfiniteScroll();
    } catch (error) {
      console.error("상품 로딩 실패:", error);
      const productsGrid = document.getElementById("products-grid");
      if (productsGrid && !isAppend) {
        productsGrid.innerHTML =
          '<div class="col-span-2 text-center py-8 text-red-500">상품을 불러오는데 실패했습니다.</div>';
      }
      updateProductListStatus(false);
      hasMore = false;
    } finally {
      isLoadingMore = false;
    }
  };

  const setupInfiniteScroll = () => {
    const statusContainer = document.getElementById("product-list-status");
    if (!statusContainer) return;

    // 기존 Observer가 있으면 해제
    if (scrollObserver) {
      scrollObserver.disconnect();
    }

    // 더 불러올 데이터가 없으면 Observer 설정하지 않음
    if (!hasMore) return;

    // Intersection Observer 생성
    scrollObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 요소가 화면에 보이고, 더 불러올 데이터가 있고, 로딩 중이 아닐 때
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          currentPage++;
          loadProducts(true); // 추가 로드
        }
      },
      {
        root: null, // viewport 기준
        rootMargin: "100px", // 100px 전에 미리 로드
        threshold: 0.1,
      },
    );

    // ProductListStatus 요소를 감시
    scrollObserver.observe(statusContainer);
  };

  const setupFilterEvents = () => {
    // 검색어 입력 이벤트 (debounce)
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          currentSearch = e.target.value.trim();
          resetAndLoadProducts();
        }, 300);
      });
    }

    // 정렬 변경 이벤트
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        resetAndLoadProducts();
      });
    }

    // 개수 변경 이벤트
    const limitSelect = document.getElementById("limit-select");
    if (limitSelect) {
      limitSelect.addEventListener("change", (e) => {
        currentLimit = parseInt(e.target.value);
        resetAndLoadProducts();
      });
    }
  };

  const loadCategories = async () => {
    const categoryContainer = document.getElementById("category1-container");
    if (!categoryContainer) return;

    try {
      const { getCategories } = await import("../api/productApi.js");
      categoriesData = await getCategories();

      // 카테고리 이벤트 설정 (한 번만 - 이벤트 위임 사용)
      setupCategoryEvents();
      updateBreadcrumb();

      // 카테고리 버튼 렌더링 (URL에서 복원된 상태에 따라)
      if (selectedCategory1) {
        renderCategory2Buttons(selectedCategory1);
      } else {
        renderCategory1Buttons();
      }

      // 필터 이벤트 설정
      setupFilterEvents();

      // 필터 상태 복원
      const restoreFilterState = () => {
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = currentSearch;

        const sortSelect = document.getElementById("sort-select");
        if (sortSelect) sortSelect.value = currentSort;

        const limitSelect = document.getElementById("limit-select");
        if (limitSelect) limitSelect.value = currentLimit.toString();
      };
      restoreFilterState();

      // 초기 상품 목록 로드 (내부에서 setupInfiniteScroll 호출됨)
      loadProducts(false);
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
      categoryContainer.innerHTML = '<div class="text-sm text-red-500">카테고리 로딩 실패</div>';
    }
  };

  return {
    content: /*html*/ `
    ${searchAndFilter()}
    <!-- 상품 목록 -->
    <div class="mb-6">
      <div>
        <!-- 상품 개수 정보 -->
        <div id="product-count-info" class="mb-4 text-sm text-gray-600"></div>
        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
        </div>

        <div class="text-center py-4" id="product-list-status">
          ${ProductListStatus(true)}
        </div>
      </div>
    </div>
    `,
    headerOptions: {
      showBackButton: false,
      isTitleLink: true,
      title: "쇼핑몰",
      link: "/",
    },
    init: loadCategories,
  };
};
