import productStore from "../Store/product.js";
import { router } from "../Router/router.js";
import SearchInput from "../components/product/search/SearchInput.js";
import Breadcrumb from "../components/product/search/Breadcrumb.js";
import CategoryButtons from "../components/product/search/CategoryButtons.js";
import FilterOptions from "../components/product/search/FilterOptions.js";
import productList from "../components/product/list.js";
import skeleton from "../components/product/skeleton.js";

let eventsInitialized = false;

/**
 * 검색, 필터, 카테고리 등 모든 이벤트 리스너를 설정합니다.
 * 이벤트 위임을 사용하여 body에 한 번만 리스너를 등록합니다.
 */
function setupEventListeners() {
  if (eventsInitialized) return;

  document.body.addEventListener("click", (e) => {
    const productSearchFilter = e.target.closest("#product-search-filter");
    if (!productSearchFilter) return;

    // --- 카테고리 버튼 클릭 처리 ---
    const categoryBtn = e.target.closest(".category1-filter-btn, .category2-filter-btn");
    if (categoryBtn) {
      const { category1, category2 } = categoryBtn.dataset;
      const newQuery = { page: 1 };
      if (category1) newQuery.category1 = category1;
      if (category2) {
        newQuery.category2 = category2;
      } else {
        newQuery.category2 = ""; // 1뎁스 카테고리 클릭 시 2뎁스는 초기화
      }
      router.updateQuery(newQuery);
      return;
    }

    // --- 브레드크럼 클릭 처리 ---
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

  // --- 검색 입력 처리 ---
  document.body.addEventListener("keydown", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      e.preventDefault(); // form 전송 방지
      router.updateQuery({ page: 1, search: e.target.value });
    }
  });

  // --- 개수/정렬 필터 변경 처리 ---
  document.body.addEventListener("change", (e) => {
    if (e.target.id === "limit-select") {
      router.updateQuery({ page: 1, limit: e.target.value });
    } else if (e.target.id === "sort-select") {
      router.updateQuery({ page: 1, sort: e.target.value });
    }
  });

  eventsInitialized = true;
}

// 검색/필터 영역을 렌더링하는 헬퍼 함수
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
  setupEventListeners();

  /**
   * 랜더링 함수 (스토어 업데이트 시 실행)
   * */
  const handleStoreUpdate = () => {
    // 이 페이지가 DOM에 실제로 존재하는지 확인
    const productListPage = document.getElementById("product-list-page");
    if (!productListPage) {
      return;
    }

    // 상품정보, 로딩여부, 페이징 데이터 state 가져오기
    const { products, loading, pagination, params, categories } = productStore.getState();
    const productSearchFilter = document.getElementById("product-search-filter");
    const productListContainer = document.getElementById("product-list-container");

    if (productSearchFilter) {
      productSearchFilter.innerHTML = renderSearchFilter(params, categories);
    }

    if (productListContainer) {
      // 로딩 중이고, 기존 상품이 없을 때만 스켈레톤 UI 표시
      if (loading && products.length === 0) {
        productListContainer.innerHTML = skeleton();
      } else {
        productListContainer.innerHTML = productList({
          list: products,
          hasNext: pagination.hasNext,
        });
      }
    }
  };

  /**
   * 스토어 구독
   * TODO : 라이프 싸이클 구현을 통해 메모리 누수 관리 (unmounted 훅 필요)
   * --> 다른 페이지 접근 후 재접근 시 스토어 구독이 중복되어 실행 됨 (unmounted 훅에서 구독취소 로직 필요)
   * */
  let cancelSubscribe = productStore.subscribe(handleStoreUpdate);
  console.log("ProductListPage - Proudct 스토어 구독 취소 콜백", cancelSubscribe);

  /**
   * URL 파라미터에 따라 초기 데이터 요청
   * setParams는 state를 변경하고,
   * setParams의 내부 로직 중 this.#setState에서 notify()를 통해 리렌더링 실시 (handleStoreUpdate)
   * */
  productStore.setParams(queryParams);
  productStore.getCategories();

  /**
   * ProductListPage.js 호출 후 초기 페이지 DOM
   * 처음에는 skeleton 호출
   * 데이터 로딩이 완료시, 구독된 handleStoreUpdate 함수 실행 (상품 목록 채워진 버전으로 리렌더링).
   * */
  const initialState = productStore.getState();
  return `
      <main id="product-list-page" class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4" id="product-search-filter">
            ${renderSearchFilter(initialState.params, initialState.categories)}
        </div>
        <!-- 상품 목록 -->
        <div id="product-list-container" class="mb-6">
          ${skeleton()}
        </div>
      </main>`;
}
