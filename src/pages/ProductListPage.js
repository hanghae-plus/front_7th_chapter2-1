import productStore from "../Store/product.js";
import { router } from "../Router/router.js";
import SearchInput from "../components/product/search/SearchInput.js";
import Breadcrumb from "../components/product/search/Breadcrumb.js";
import CategoryButtons from "../components/product/search/CategoryButtons.js";
import FilterOptions from "../components/product/search/FilterOptions.js";
import productCard from "../components/product/card.js";
import skeleton from "../components/product/skeleton.js";
import spiningLoading from "../components/product/spiningLoading.js";

let eventsInitialized = false;

/**
 * 이벤트 리스너 설정 (검색, 필터, 카테고리 등)
 * 이벤트 위임을 사용하여 body에 한 번만 리스너 등록
 */
function setupEventListeners() {
  if (eventsInitialized) return;

  document.body.addEventListener("click", (e) => {
    const productSearchFilter = e.target.closest("#product-search-filter");
    if (!productSearchFilter) return;

    /**
     * 카테고리 버튼 클릭 이벤트
     * */
    const categoryBtn = e.target.closest(".category1-filter-btn, .category2-filter-btn");
    if (categoryBtn) {
      const { category1, category2 } = categoryBtn.dataset;
      const newQuery = { page: 1, category1: category1 || "", category2: category2 || "" };
      if (!category2) newQuery.category2 = "";
      router.updateQuery(newQuery);
      return;
    }

    /**
     * 브레드 크럼 클릭 이벤트
     * */
    const breadcrumbBtn = e.target.closest("[data-breadcrumb]");
    if (breadcrumbBtn) {
      const { breadcrumb } = breadcrumbBtn.dataset;
      const newQuery = { page: 1 };
      if (breadcrumb === "reset") {
        newQuery.category1 = "";
        newQuery.category2 = "";
      } else if (breadcrumb === "category1") {
        newQuery.category2 = "";
      }
      router.updateQuery(newQuery);
      return;
    }
  });

  /**
   * 검색어 입력 이벤트
   * */
  document.body.addEventListener("keydown", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      e.preventDefault();
      router.updateQuery({ page: 1, search: e.target.value });
    }
  });

  /**
   * 개수/정렬 필터 이벤트
   * */
  document.body.addEventListener("change", (e) => {
    if (e.target.id === "limit-select") {
      router.updateQuery({ page: 1, limit: e.target.value });
    } else if (e.target.id === "sort-select") {
      router.updateQuery({ page: 1, sort: e.target.value });
    }
  });

  eventsInitialized = true;
}

/**
 * 검색 & 필터 영역 렌더링 함수
 * @param {Object} params productStore의 state.params
 * @param {Object} categories productStore의 categories
 * */
function renderSearchFilter(params, categories) {
  const { search, category1, category2, limit, sort } = params;
  return `
    ${SearchInput({ search })}
    <div class="space-y-3">
        <div class="space-y-2">
            ${Breadcrumb({ category1, category2 })}
            ${CategoryButtons({ categories, category1, category2 })}
        </div>
        ${FilterOptions({ limit, sort })}
    </div>
  `;
}

export function ProductListPage(queryParams) {
  // 이벤트 리스너는 한 번만 설정
  // refactor : onMount에서 설
  // setupEventListeners();

  /**
   * 랜더링 함수 (스토어 업데이트 시 실행)
   * */
  const handleStoreUpdate = () => {
    const productListPage = document.getElementById("product-list-page");
    if (!productListPage) return;

    // 상품정보, 로딩여부, 페이징 데이터 state 가져오기
    const { products, loading, pagination, params, categories } = productStore.getState();

    const productSearchFilter = document.getElementById("product-search-filter");
    if (productSearchFilter) {
      productSearchFilter.innerHTML = renderSearchFilter(params, categories);
    }

    // 상품 총 갯수
    const countSpan = document.getElementById("product-total-count");
    if (countSpan) {
      countSpan.textContent = pagination.total.toLocaleString();
    }

    const grid = document.getElementById("products-grid");
    if (grid) {
      if (params.page === 1) {
        grid.innerHTML = loading && products.length === 0 ? skeleton() : products.map((p) => productCard(p)).join("");
      } else {
        const existingCardCount = grid.querySelectorAll(".product-card").length;
        const newProducts = products.slice(existingCardCount);
        if (newProducts.length > 0) {
          const newCardsHTML = newProducts.map((p) => productCard(p)).join("");
          grid.insertAdjacentHTML("beforeend", newCardsHTML);
        }
      }
    }

    const footerIndicator = document.getElementById("list-footer-indicator");
    if (footerIndicator) {
      if (loading && params.page > 1) {
        footerIndicator.innerHTML = spiningLoading();
      } else if (!pagination.hasNext) {
        footerIndicator.innerHTML = `<div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>`;
      } else {
        footerIndicator.innerHTML = "";
      }
    }
  };

  const onMount = () => {
    // 1. 이벤트 리스너 설정
    setupEventListeners();

    // 2. 스토어 구독
    const unsubscribe = productStore.subscribe(handleStoreUpdate);

    // 3. IntersectionObserver 설정 (무한 스크롤)
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const { loading, pagination } = productStore.getState();
        if (firstEntry.isIntersecting && !loading && pagination.hasNext) {
          productStore.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const target = document.getElementById("list-footer-indicator");
    if (target) {
      observer.observe(target);
    }

    // 4. 초기 데이터 로드
    // setParams는 state를 변경하고
    // setParams의 내부 로직 중 this.#setState에서 notify()를 통해 리렌더링 실시 (handleStoreUpdate)
    productStore.setParams(queryParams);
    productStore.getCategories();

    // 5. unmount 시 옵저버 패턴 구독 취소 (product 스토어 + intersectionObserver)
    return () => {
      unsubscribe();
      observer.disconnect();
    };
  };

  /**
   * ProductListPage.js 호출 후 초기 페이지 DOM
   * 처음에는 skeleton 호출
   * 데이터 로딩이 완료시, 구독된 handleStoreUpdate 함수 실행 (상품 목록 채워진 버전으로 리렌더링).
   * */
  const initialState = productStore.getState();
  return {
    html: `
      <main id="product-list-page" class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4" id="product-search-filter">
            ${renderSearchFilter(initialState.params, initialState.categories)}
        </div>
        <!-- 상품 목록 -->
        <div id="product-list-container" class="mb-6">
          <div class="mb-4 text-sm text-gray-600">
            총 <span id="product-total-count" class="font-medium text-gray-900">0</span>개의 상품
          </div>
          <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            ${skeleton()}
          </div>
          <div id="list-footer-indicator"></div>
        </div>
      </main>`,
    onMount,
  };
}
