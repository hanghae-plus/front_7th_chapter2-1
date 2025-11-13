const CategoryBreadcrumb = () => {
  return /*html*/ `
    <div class="flex items-center gap-2" id="category-breadcrumb">
      <label class="text-sm text-gray-600">카테고리:</label>
      <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
    </div>
  `;
};

const ProductListStatus = () => {
  return /*html*/ `
    <div class="text-center py-4" id="product-list-status">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
      </div>
    </div>
  `;
};

const getProductListStatusContent = (isLoading) => {
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

  return /*html*/ `
    <span class="text-sm text-gray-600">모든 상품을 확인했습니다</span>
  `;
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
          ${CategoryBreadcrumb()}
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

export const ItemListPage = () => {
  let categoriesData = null;
  let selectedCategory1 = null;
  let selectedCategory2 = null;
  let currentSearch = "";
  let currentSort = "price_asc";
  let currentLimit = 20;
  let currentPage = 1;
  let searchTimeout = null;

  const updateBreadcrumb = () => {
    const breadcrumbContainer = document.getElementById("category-breadcrumb");
    if (!breadcrumbContainer) return;

    // 기존 내용 중 label은 유지하고, 그 이후 요소들만 제거
    const label = breadcrumbContainer.querySelector("label");
    breadcrumbContainer.innerHTML = "";
    if (label) {
      breadcrumbContainer.appendChild(label);
    }

    // 전체 버튼 추가
    const resetButton = document.createElement("button");
    resetButton.setAttribute("data-breadcrumb", "reset");
    resetButton.className = "text-xs hover:text-blue-800 hover:underline";
    resetButton.textContent = "전체";
    breadcrumbContainer.appendChild(resetButton);

    // 1depth가 선택된 경우
    if (selectedCategory1) {
      const separator1 = document.createElement("span");
      separator1.className = "text-xs text-gray-400";
      separator1.textContent = ">";
      breadcrumbContainer.appendChild(separator1);

      const category1Button = document.createElement("button");
      category1Button.setAttribute("data-breadcrumb", "category1");
      category1Button.setAttribute("data-category1", selectedCategory1);
      category1Button.className = "text-xs hover:text-blue-800 hover:underline";
      category1Button.textContent = selectedCategory1;
      breadcrumbContainer.appendChild(category1Button);

      // 2depth가 선택된 경우
      if (selectedCategory2) {
        const separator2 = document.createElement("span");
        separator2.className = "text-xs text-gray-400";
        separator2.textContent = ">";
        breadcrumbContainer.appendChild(separator2);

        const category2Span = document.createElement("span");
        category2Span.className = "text-xs text-gray-700";
        category2Span.textContent = selectedCategory2;
        breadcrumbContainer.appendChild(category2Span);
      }
    }
  };

  const setupBreadcrumbEvents = () => {
    const breadcrumbContainer = document.getElementById("category-breadcrumb");
    if (!breadcrumbContainer) return;

    // 이벤트 위임 사용 - 한 번만 등록
    breadcrumbContainer.addEventListener("click", (e) => {
      const target = e.target;
      const breadcrumbType = target.getAttribute("data-breadcrumb");

      if (breadcrumbType === "reset") {
        selectedCategory1 = null;
        selectedCategory2 = null;
        currentPage = 1;
        updateBreadcrumb();
        renderCategory1Buttons();
        loadProducts();
      } else if (breadcrumbType === "category1") {
        const category1 = target.getAttribute("data-category1");
        selectedCategory1 = category1;
        selectedCategory2 = null;
        currentPage = 1;
        updateBreadcrumb();
        renderCategory2Buttons(category1);
        loadProducts();
      }
    });
  };

  const renderCategory1Buttons = () => {
    const categoryContainer = document.getElementById("category1-container");
    if (!categoryContainer || !categoriesData) return;

    // 1depth 카테고리 버튼 생성
    const categoryButtons = Object.keys(categoriesData)
      .map(
        (category1) => `
        <button data-category1="${category1}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
           bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
          ${category1}
        </button>
      `,
      )
      .join("");

    categoryContainer.innerHTML = categoryButtons;

    // 1depth 카테고리 버튼에 클릭 이벤트 추가
    categoryContainer.querySelectorAll(".category1-filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category1 = e.target.getAttribute("data-category1");
        selectedCategory1 = category1;
        selectedCategory2 = null;
        currentPage = 1;
        updateBreadcrumb();
        renderCategory2Buttons(category1);
        loadProducts();
      });
    });
  };

  const renderCategory2Buttons = (category1) => {
    const categoryContainer = document.getElementById("category1-container");
    if (!categoryContainer || !categoriesData || !categoriesData[category1]) return;

    const category2List = Object.keys(categoriesData[category1]);

    // 2depth 카테고리 버튼 생성
    const categoryButtons = category2List
      .map(
        (category2) => `
        <button data-category1="${category1}" data-category2="${category2}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
           bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
          ${category2}
        </button>
      `,
      )
      .join("");

    categoryContainer.innerHTML = categoryButtons;

    // 2depth 카테고리 버튼에 클릭 이벤트 추가
    categoryContainer.querySelectorAll(".category2-filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category1 = e.target.getAttribute("data-category1");
        const category2 = e.target.getAttribute("data-category2");
        selectedCategory1 = category1;
        selectedCategory2 = category2;
        currentPage = 1;
        updateBreadcrumb();
        loadProducts();
      });
    });
  };

  const updateProductListStatus = (isLoading) => {
    const statusContainer = document.getElementById("product-list-status");
    if (!statusContainer) return;

    // 최상위 div는 유지하고 내부 내용만 업데이트
    statusContainer.innerHTML = getProductListStatusContent(isLoading);
  };

  const renderProducts = (products, total) => {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    if (products.length === 0) {
      productsGrid.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-500">상품이 없습니다.</div>';
      updateProductListStatus(false);
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
                <p class="text-xs text-gray-500 mb-2">${product.mallName || ""}</p>
                <p class="text-lg font-bold text-gray-900">
                  ${Number(product.lprice || product.price || 0).toLocaleString()}원
                </p>
              </div>
              <!-- 장바구니 버튼 -->
              <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                      hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${product.productId}">
                장바구니 담기
              </button>
            </div>
          </div>
    `,
      )
      .join("");

    productsGrid.innerHTML = productsHTML;

    // 상품 개수 정보 업데이트
    const productCountInfo = document.getElementById("product-count-info");
    if (productCountInfo) {
      productCountInfo.innerHTML = `총 <span class="font-medium text-gray-900">${total}개</span>의 상품`;
    }

    // 상태를 완료로 업데이트
    updateProductListStatus(false);
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

  const loadProducts = async () => {
    showLoading();

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

      renderProducts(response.products || [], response.pagination?.total || 0);
    } catch (error) {
      console.error("상품 로딩 실패:", error);
      const productsGrid = document.getElementById("products-grid");
      if (productsGrid) {
        productsGrid.innerHTML =
          '<div class="col-span-2 text-center py-8 text-red-500">상품을 불러오는데 실패했습니다.</div>';
      }
    }
  };

  const setupFilterEvents = () => {
    // 검색어 입력 이벤트 (debounce)
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          currentSearch = e.target.value.trim();
          currentPage = 1;
          loadProducts();
        }, 300);
      });
    }

    // 정렬 변경 이벤트
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        loadProducts();
      });
    }

    // 개수 변경 이벤트
    const limitSelect = document.getElementById("limit-select");
    if (limitSelect) {
      limitSelect.addEventListener("change", (e) => {
        currentLimit = parseInt(e.target.value);
        currentPage = 1;
        loadProducts();
      });
    }
  };

  const loadCategories = async () => {
    const categoryContainer = document.getElementById("category1-container");
    if (!categoryContainer) return;

    try {
      const { getCategories } = await import("../api/productApi.js");
      categoriesData = await getCategories();

      // 초기 상태 설정
      selectedCategory1 = null;
      selectedCategory2 = null;

      // breadcrumb 이벤트 설정 (한 번만)
      setupBreadcrumbEvents();
      updateBreadcrumb();
      renderCategory1Buttons();

      // 필터 이벤트 설정
      setupFilterEvents();

      // 초기 상품 목록 로드
      loadProducts();
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
      categoryContainer.innerHTML = '<div class="text-sm text-red-500">카테고리 로딩 실패</div>';
    }
  };

  return {
    content: /*html*/ `
    <main class="max-w-md mx-auto px-4 py-4">
    ${searchAndFilter()}
    <!-- 상품 목록 -->
    <div class="mb-6">
      <div>
        <!-- 상품 개수 정보 -->
        <div id="product-count-info" class="mb-4 text-sm text-gray-600"></div>
        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
        </div>

        ${ProductListStatus()}
      </div>
    </div>
  </main>
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
