import { Home } from "../pages/home.js";
import { Search, updateCategoryBreadcrumb, updateCategoryButtons, ItemList } from "../components/index.js";
import { state } from "../state/appState.js";

// 모듈 레벨 상태
let homeShellMounted = false;
let searchSectionInitialized = false;

/**
 * 홈 셸 마운트 상태를 리셋합니다.
 */
export function resetHomeShell() {
  homeShellMounted = false;
  searchSectionInitialized = false;
}

/**
 * 검색 섹션 초기화 상태를 확인합니다.
 * @returns {boolean} 초기화 여부
 */
export function isSearchSectionInitialized() {
  return searchSectionInitialized;
}

/**
 * 홈 뷰를 렌더링합니다.
 * @param {HTMLElement} root - 루트 요소
 * @param {Object} options - 옵션
 * @param {Function} options.attachHeaderNavigation - 헤더 네비게이션 연결 함수
 * @param {Function} options.initializeSearchSection - 검색 섹션 초기화 함수
 * @param {Function} options.updateSearchUI - 검색 UI 업데이트 함수
 * @param {Function} options.renderProductSection - 상품 섹션 렌더링 함수
 * @param {Function} options.setupLoadMoreObserver - 무한 스크롤 옵저버 설정 함수
 */
export function renderHomeView(
  root,
  { attachHeaderNavigation, initializeSearchSection, updateSearchUI, renderProductSection, setupLoadMoreObserver },
) {
  if (!homeShellMounted) {
    root.innerHTML = Home();
    homeShellMounted = true;
    searchSectionInitialized = false;
    attachHeaderNavigation(root);
  }

  const searchContainer = document.getElementById("search-section");
  const productContainer = document.getElementById("product-section");

  if (!searchContainer || !productContainer) {
    root.innerHTML = Home();
    homeShellMounted = true;
    searchSectionInitialized = false;
    attachHeaderNavigation(root);
  }

  if (!searchSectionInitialized) {
    initializeSearchSection();
  }

  updateSearchUI();
  renderProductSection();
  setupLoadMoreObserver(root);
}

/**
 * 검색 섹션을 초기화합니다.
 * @param {Object} options - 옵션
 * @param {Function} options.onSearchInputKeyDown - 검색 입력 키다운 핸들러
 * @param {Function} options.onSelectLimit - 개수 선택 핸들러
 * @param {Function} options.onSelectSort - 정렬 선택 핸들러
 * @param {Function} options.onCategoryBreadcrumbClick - 카테고리 브레드크럼 클릭 핸들러
 * @param {Function} options.onCategoryButtonsClick - 카테고리 버튼 클릭 핸들러
 */
export function initializeSearchSection({
  onSearchInputKeyDown,
  onSelectLimit,
  onSelectSort,
  onCategoryBreadcrumbClick,
  onCategoryButtonsClick,
}) {
  const searchContainer = document.getElementById("search-section");
  if (!searchContainer) return;

  searchContainer.innerHTML = Search({
    loading: state.isLoadingCategories,
    limit: state.limit,
    sort: state.sort,
    selectedCategory1: state.selectedCategory1,
    selectedCategory2: state.selectedCategory2,
    categories: state.categories,
  });

  searchSectionInitialized = true;

  // 이벤트 리스너 연결
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = state.searchTerm;
    searchInput.addEventListener("keydown", onSearchInputKeyDown);
  }

  const limitSelect = document.getElementById("limit-select");
  if (limitSelect) {
    limitSelect.addEventListener("change", onSelectLimit);
  }

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", onSelectSort);
  }

  const categoryBreadcrumb = document.getElementById("category-breadcrumb");
  if (categoryBreadcrumb) {
    categoryBreadcrumb.addEventListener("click", onCategoryBreadcrumbClick);
  }

  const categoryButtons = document.getElementById("category-buttons");
  if (categoryButtons) {
    categoryButtons.addEventListener("click", onCategoryButtonsClick);
  }
}

/**
 * 검색 UI를 업데이트합니다.
 */
export function updateSearchUI() {
  if (!searchSectionInitialized) {
    return;
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = state.searchTerm;
  }

  const categoryBreadcrumb = document.getElementById("category-breadcrumb");
  if (categoryBreadcrumb) {
    categoryBreadcrumb.innerHTML = updateCategoryBreadcrumb({
      selectedCategory1: state.selectedCategory1,
      selectedCategory2: state.selectedCategory2,
    });
  }

  const categoryButtons = document.getElementById("category-buttons");
  if (categoryButtons) {
    categoryButtons.innerHTML = updateCategoryButtons({
      categories: state.categories,
      selectedCategory1: state.selectedCategory1,
      selectedCategory2: state.selectedCategory2,
      loading: state.isLoadingCategories,
    });
  }

  const limitSelect = document.getElementById("limit-select");
  if (limitSelect) {
    limitSelect.value = String(state.limit);
  }

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.value = state.sort;
  }
}

/**
 * 상품 섹션을 렌더링합니다.
 * @param {Object} options - 옵션
 * @param {Function} options.onAddToCart - 장바구니 추가 핸들러
 * @param {Function} options.onProductCardClick - 상품 카드 클릭 핸들러
 * @param {Function} options.onRetry - 재시도 핸들러
 * @param {Function} options.onLoadMoreRetry - 더보기 재시도 핸들러
 */
export function renderProductSection({ onAddToCart, onProductCardClick, onRetry, onLoadMoreRetry }) {
  const productContainer = document.getElementById("product-section");
  if (!productContainer) return;

  productContainer.innerHTML = ItemList({
    loading: state.isLoadingProducts,
    loadingMore: state.isLoadingMore,
    products: state.products,
    error: state.productsError,
    hasMore: state.hasMoreProducts,
    loadMoreError: state.loadMoreError,
    totalCount: state.totalProducts,
  });

  const addToCartButtons = productContainer.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const productId = button.dataset.productId;
      if (!productId) {
        return;
      }
      onAddToCart(productId, 1);
    });
  });

  const retryButton = productContainer.querySelector("#products-retry-button");
  if (retryButton) {
    retryButton.addEventListener("click", onRetry, { once: true });
  }

  const loadMoreRetryButton = productContainer.querySelector("#products-load-more-retry-button");
  if (loadMoreRetryButton) {
    loadMoreRetryButton.addEventListener("click", onLoadMoreRetry, {
      once: true,
    });
  }

  const productCards = productContainer.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", onProductCardClick);
  });
}
