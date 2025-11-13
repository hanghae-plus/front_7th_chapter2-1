import { getProducts as fetchProducts, getCategories as fetchCategories } from "../../api/productApi.js";
import { ProductList, SearchBox } from "./components/index.js";
import { TotalProductCount } from "./components/Total.js";
import { createSignal } from "../../store/signal.js";

/**
 * @typedef {Object} ProductListType
 * @property {Filter} filters
 * @property {Pagination} pagination
 * @property {Product[]} products
 */

// Signal 생성: loading과 캐시된 데이터만 상태관리
const [getLoading, setLoading, subscribeLoading] = createSignal(true);
const [getProducts, setProducts, subscribeProducts] = createSignal([]);
const [getCategories, setCategories, subscribeCategories] = createSignal({});

// URL 쿼리 파라미터에서 필터 값 읽기
function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    category1: params.get("category1") || null,
    category2: params.get("category2") || null,
    limit: parseInt(params.get("limit")) || 20,
    sort: params.get("sort") || "price_asc",
  };
}

// URL 쿼리 파라미터 업데이트 (기본값이 아닌 경우에만 추가)
function updateURL(filters) {
  const params = new URLSearchParams();

  // 카테고리는 null이 아닌 경우에만 추가
  if (filters.category1) params.set("category1", filters.category1);
  if (filters.category2) params.set("category2", filters.category2);

  // limit는 기본값(20)이 아닌 경우에만 추가
  if (filters.limit && filters.limit !== 20) {
    params.set("limit", filters.limit.toString());
  }

  // sort는 기본값(price_asc)이 아닌 경우에만 추가
  if (filters.sort && filters.sort !== "price_asc") {
    params.set("sort", filters.sort);
  }

  const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
  window.history.pushState({}, "", newURL);
}

// 카테고리 변경 핸들러
const handleCategoryChange = (category1, category2) => {
  const currentFilters = getFiltersFromURL();
  updateURL({
    category1,
    category2,
    limit: currentFilters.limit,
    sort: currentFilters.sort,
  });
  loadProducts();
};

// Limit 변경 핸들러
const handleLimitChange = (limit) => {
  const currentFilters = getFiltersFromURL();
  updateURL({
    ...currentFilters,
    limit,
  });
  loadProducts();
};

// Sort 변경 핸들러
const handleSortChange = (sort) => {
  const currentFilters = getFiltersFromURL();
  updateURL({
    ...currentFilters,
    sort,
  });
  loadProducts();
};

// UI 렌더링 함수
function renderUI() {
  const filters = getFiltersFromURL();
  const loading = getLoading();
  const categories = getCategories();
  const products = getProducts();

  const searchContainer = document.querySelector("#search-box-container");
  if (searchContainer) {
    searchContainer.innerHTML = SearchBox(
      loading,
      categories,
      handleCategoryChange,
      handleLimitChange,
      handleSortChange,
      filters.limit,
      filters.sort,
      filters.category1,
      filters.category2,
    );
  }

  const totalContainer = document.querySelector("#total-count-container");
  if (totalContainer) {
    totalContainer.innerHTML = TotalProductCount(products.length);
  }

  const productsContainer = document.querySelector("#products-container");
  if (productsContainer) {
    productsContainer.innerHTML = ProductList(loading, products);
  }
}

// loading 변경 시 UI 리렌더링
subscribeLoading(() => {
  renderUI();
});

// products 변경 시 UI 리렌더링
subscribeProducts(() => {
  renderUI();
});

// categories 변경 시 UI 리렌더링
subscribeCategories(() => {
  renderUI();
});

// 상품 목록 로드 (URL 쿼리 파라미터에서 필터 읽기)
async function loadProducts() {
  try {
    setLoading(true);

    const filters = getFiltersFromURL();
    const params = {
      limit: filters.limit,
      sort: filters.sort,
    };
    if (filters.category1) params.category1 = filters.category1;
    if (filters.category2) params.category2 = filters.category2;

    console.log("loadProducts with params:", params);
    const productList = await fetchProducts(params);
    console.log("productList", productList);

    setProducts(productList.products);
    setLoading(false);
  } catch (error) {
    console.error("Failed to load products:", error);
    setLoading(false);
  }
}

// 초기 데이터 로드
async function loadInitialData() {
  try {
    // 카테고리 목록 로드
    const categoryList = await fetchCategories();
    console.log("categoryList", categoryList);
    setCategories(categoryList);

    // URL 파라미터를 기반으로 상품 목록 로드
    await loadProducts();
  } catch (error) {
    console.error("Failed to load data:", error);
    setLoading(false);
  }
}

// 브라우저 뒤로가기/앞으로가기 처리
let isInitialized = false;

function setupPopStateListener() {
  if (isInitialized) return;
  isInitialized = true;

  window.addEventListener("popstate", () => {
    console.log("popstate event - URL changed:", window.location.search);
    loadProducts();
  });
}

// eslint-disable-next-line no-unused-vars
export const Home = (_params = {}) => {
  // DOM 마운트 후 데이터 로드 및 이벤트 리스너 설정
  setTimeout(() => {
    setupPopStateListener();
    loadInitialData();
  }, 0);

  // 초기 UI 반환 (URL에서 필터 값 읽기)
  const filters = getFiltersFromURL();
  return `<main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div id="search-box-container">
          ${SearchBox(
            true,
            {},
            handleCategoryChange,
            handleLimitChange,
            handleSortChange,
            filters.limit,
            filters.sort,
            filters.category1,
            filters.category2,
          )}
        </div>
        
        <!-- 상품 개수 -->
        <div id="total-count-container">
          ${TotalProductCount(getProducts().length)}
        </div>
        
        <!-- 상품 목록 컨테이너 -->
        <div id="products-container">
          ${ProductList(true, [])}
        </div>
      </main>`;
};
