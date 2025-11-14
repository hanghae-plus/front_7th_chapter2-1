import { getProducts as fetchProducts, getCategories as fetchCategories } from "../../api/productApi.js";
import { ProductList, SearchBox } from "./components/index.js";
import { TotalProductCount } from "./components/Total.js";
import { NotFound } from "./components/NotFound.js";
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
const [getAllProducts, setAllProducts] = createSignal([]); // 필터링 전 전체 상품
const [getHasMore, setHasMore] = createSignal(true); // 더 불러올 데이터가 있는지
const [getCurrentPage, setCurrentPage] = createSignal(1); // 현재 페이지

// URL 쿼리 파라미터에서 필터 값 읽기
function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    category1: params.get("category1") || null,
    category2: params.get("category2") || null,
    limit: parseInt(params.get("limit")) || 20,
    sort: params.get("sort") || "price_asc",
    search: params.get("search") || "",
    current: parseInt(params.get("current")) || 1,
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

  // search는 값이 있는 경우에만 추가
  if (filters.search && filters.search.trim() !== "") {
    params.set("search", filters.search.trim());
  }

  // current는 기본값(1)이 아닌 경우에만 추가
  if (filters.current && filters.current > 1) {
    params.set("current", filters.current.toString());
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
    search: currentFilters.search,
  });
  resetAndLoadProducts();
};

// Limit 변경 핸들러
const handleLimitChange = (limit) => {
  const currentFilters = getFiltersFromURL();
  updateURL({
    ...currentFilters,
    limit,
  });
  resetAndLoadProducts();
};

// Sort 변경 핸들러
const handleSortChange = (sort) => {
  const currentFilters = getFiltersFromURL();
  updateURL({
    ...currentFilters,
    sort,
  });
  resetAndLoadProducts();
};

// 검색 변경 핸들러
const handleSearchChange = (searchText) => {
  const currentFilters = getFiltersFromURL();
  updateURL({
    ...currentFilters,
    search: searchText,
  });
  applyFilters();
};

// UI 렌더링 함수
function renderUI() {
  const filters = getFiltersFromURL();
  const loading = getLoading();
  const categories = getCategories();
  const products = getProducts();
  const hasMore = getHasMore();
  const currentPage = getCurrentPage();
  const isLoadingMore = loading && currentPage > 1;

  const searchContainer = document.querySelector("#search-box-container");
  if (searchContainer) {
    searchContainer.innerHTML = SearchBox(
      loading,
      categories,
      handleCategoryChange,
      handleLimitChange,
      handleSortChange,
      handleSearchChange,
      filters.limit,
      filters.sort,
      filters.category1,
      filters.category2,
      filters.search,
    );
  }

  const contentContainer = document.querySelector("#content-container");
  if (contentContainer) {
    // 로딩 중이 아니고 상품이 없을 때 NotFound 표시
    if (!loading && products.length === 0) {
      contentContainer.innerHTML = NotFound();
    } else {
      contentContainer.innerHTML = `
        ${
          products.length > 0
            ? `
          <!-- 상품 개수 -->
          <div id="total-count-container">
            ${TotalProductCount(products.length)}
          </div>
        `
            : ""
        }
        
        <!-- 상품 목록 컨테이너 -->
        <div id="products-container">
          ${ProductList(loading, products, isLoadingMore, hasMore)}
        </div>
        
        <!-- 무한 스크롤 감지 요소 -->
        <div id="infinite-scroll-sentinel" style="height: 1px;"></div>
      `;
    }
  }
}

// loading 변경 시 UI 리렌더링
subscribeLoading(() => {
  renderUI();
});

// products 변경 시 UI 리렌더링 및 Observer 재설정
subscribeProducts(() => {
  renderUI();
  // UI 업데이트 후 observer 재설정 (상품이 있을 때만)
  setTimeout(() => {
    if (getProducts().length > 0) {
      setupIntersectionObserver();
    }
  }, 100);
});

// categories 변경 시 UI 리렌더링
subscribeCategories(() => {
  renderUI();
});

// 클라이언트 측 필터 적용 (검색어 필터링)
function applyFilters() {
  const filters = getFiltersFromURL();
  const allProducts = getAllProducts();

  // 검색어로 필터링 (product.title만 해당)
  let filteredProducts = allProducts;
  if (filters.search && filters.search.trim() !== "") {
    const searchLower = filters.search.toLowerCase();
    filteredProducts = allProducts.filter((product) => product.title.toLowerCase().includes(searchLower));
  }

  setProducts(filteredProducts);
}

// 페이지 초기화 후 상품 목록 로드
function resetAndLoadProducts() {
  setCurrentPage(1);
  setHasMore(true);
  setAllProducts([]);
  setProducts([]);
  loadProducts(1);
}

// 상품 목록 로드 (URL 쿼리 파라미터에서 필터 읽기)
async function loadProducts(page = 1) {
  try {
    if (!getHasMore() && page > 1) {
      console.log("No more products to load");
      return;
    }

    setLoading(true);

    const filters = getFiltersFromURL();
    const params = {
      limit: filters.limit,
      sort: filters.sort,
      page: page, // API는 page 기반으로 작동
    };
    if (filters.category1) params.category1 = filters.category1;
    if (filters.category2) params.category2 = filters.category2;

    console.log("loadProducts with params:", params, "page:", page);
    const productList = await fetchProducts(params);
    console.log("productList", productList);

    // 페이지가 1이면 새로 시작, 아니면 기존 데이터에 추가
    const currentProducts = page === 1 ? [] : getAllProducts();
    const newProducts = [...currentProducts, ...productList.products];

    // 전체 상품 저장
    setAllProducts(newProducts);

    // 더 이상 데이터가 없는지 확인
    if (productList.products.length < filters.limit) {
      setHasMore(false);
    }

    // 검색어 필터 적용
    applyFilters();

    setCurrentPage(page);

    // URL에 current 페이지 반영
    const currentFilters = getFiltersFromURL();
    updateURL({
      ...currentFilters,
      current: page,
    });

    setLoading(false);
  } catch (error) {
    console.error("Failed to load products:", error);
    setLoading(false);
  }
}

// 다음 페이지 로드 (무한 스크롤)
async function loadMoreProducts() {
  if (getLoading() || !getHasMore()) return;

  const nextPage = getCurrentPage() + 1;
  await loadProducts(nextPage);
}

// 초기 데이터 로드
async function loadInitialData() {
  try {
    // 카테고리 목록 로드
    const categoryList = await fetchCategories();
    console.log("categoryList", categoryList);
    setCategories(categoryList);

    // URL에서 current 페이지 확인
    const filters = getFiltersFromURL();
    const targetPage = filters.current;

    // 목표 페이지까지 순차적으로 로드
    for (let page = 1; page <= targetPage; page++) {
      await loadProducts(page);
    }
  } catch (error) {
    console.error("Failed to load data:", error);
    setLoading(false);
  }
}

// Intersection Observer 설정 (무한 스크롤)
let observer = null;

function setupIntersectionObserver() {
  // 기존 observer가 있으면 해제
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !getLoading() && getHasMore()) {
          console.log("Reached bottom, loading more products...");
          loadMoreProducts();
        }
      });
    },
    {
      root: null,
      rootMargin: "100px", // 하단 100px 전에 미리 로드
      threshold: 0.1,
    },
  );

  // sentinel 요소 관찰 시작
  const sentinel = document.querySelector("#infinite-scroll-sentinel");
  if (sentinel) {
    observer.observe(sentinel);
    console.log("Intersection Observer attached to sentinel");
  }
}

// 브라우저 뒤로가기/앞으로가기 처리
let isInitialized = false;

function setupPopStateListener() {
  if (isInitialized) return;
  isInitialized = true;

  window.addEventListener("popstate", async () => {
    console.log("popstate event - URL changed:", window.location.search);

    const filters = getFiltersFromURL();
    const targetPage = filters.current;

    // 페이지 초기화
    setCurrentPage(1);
    setHasMore(true);
    setAllProducts([]);
    setProducts([]);

    // 목표 페이지까지 순차적으로 로드
    for (let page = 1; page <= targetPage; page++) {
      await loadProducts(page);
    }
  });
}

// eslint-disable-next-line no-unused-vars
export const Home = (_params = {}) => {
  // DOM 마운트 후 데이터 로드 및 이벤트 리스너 설정
  setTimeout(() => {
    setupPopStateListener();
    loadInitialData();
    setupIntersectionObserver();
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
            handleSearchChange,
            filters.limit,
            filters.sort,
            filters.category1,
            filters.category2,
            filters.search,
          )}
        </div>
        <div class="mb-6" id="content-container">
          <!-- 상품 개수 -->
          <div id="total-count-container">
            ${TotalProductCount(getProducts().length)}
          </div>
          
          <!-- 상품 목록 컨테이너 -->
          <div id="products-container">
            ${ProductList(true, [], false, true)}
          </div>
          
          <!-- 무한 스크롤 감지 요소 -->
          <div id="infinite-scroll-sentinel" style="height: 1px;"></div>
        </div>
      </main>`;
};
