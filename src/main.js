import { error404 } from "./pages/404.js";
import { errorAlert, showToast } from "./components/Alert.js";
import { state, initializeState, createInitialDetailState } from "./state/appState.js";
import {
  parseRoute,
  navigateToDetail as navigateToDetailService,
  navigateToHome as navigateToHomeService,
} from "./services/routerService.js";
import { applyHomeQueryParams, updateHomeUrlParams, buildHomeUrlWithParams } from "./services/urlService.js";
import {
  loadProducts as loadProductsService,
  loadProductDetail as loadProductDetailService,
} from "./services/productService.js";
import { ensureCategoriesLoaded as ensureCategoriesLoadedService } from "./services/categoryService.js";
import {
  renderHomeView,
  initializeSearchSection,
  updateSearchUI,
  renderProductSection,
  resetHomeShell,
} from "./renderers/homeRenderer.js";
import { renderDetailView } from "./renderers/detailRenderer.js";
import {
  handleProductCardClick,
  handleCategoryBreadcrumbClick,
  handleCategoryButtonsClick,
  handleCategory1Select,
  handleCategory2Select,
  handleCategoryReset,
  handleCategoryBreadcrumb,
  handleSearchInputKeyDown,
  handleCartIconClick,
  attachDetailEvents,
  adjustQuantity,
  normalizeQuantityInput,
  handleAddToCart,
  renderCartModalForCart,
  attachCartModalEvents,
  attachCartEscapeListener,
  detachCartEscapeListener,
  openCartModal,
  closeCartModal,
} from "./handlers/index.js";
import { attachHeaderNavigation } from "./handlers/navigationHandlers.js";
import { setupLoadMoreObserver, disconnectLoadMoreObserver } from "./utils/observers.js";

const enableMocking = async () => {
  const { worker } = await import("./mocks/browser.js");

  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
};

// 장바구니 모달 렌더링 함수 래퍼 (재귀 호출을 위한 클로저)
function createRenderCartModalForCart() {
  const renderCartModalWrapper = () => {
    return renderCartModalForCart(
      attachCartModalEvents,
      () => attachCartEscapeListener(() => closeCartModalWrapper()),
      detachCartEscapeListener,
      renderCartModalWrapper,
      () => closeCartModalWrapper(),
    );
  };
  return renderCartModalWrapper;
}

const renderCartModalForCartWrapper = createRenderCartModalForCart();

function openCartModalWrapper() {
  openCartModal(renderCartModalForCartWrapper);
}

function closeCartModalWrapper() {
  closeCartModal(renderCartModalForCartWrapper);
}

function render() {
  const root = document.getElementById("root");
  if (!root) return;

  if (state.route?.name === "detail") {
    renderDetailView(root, {
      disconnectLoadMoreObserver,
      attachDetailEvents: (root) =>
        attachDetailEvents(root, {
          attachHeaderNavigation: (root) =>
            attachHeaderNavigation(root, {
              onNavigateToHome: handleRouteChange,
              onCartIconClick: (event) => handleCartIconClick(event, openCartModalWrapper),
            }),
          onNavigateToHome: navigateToHome,
          onNavigateToDetail: navigateToDetail,
          onAdjustQuantity: adjustQuantity,
          onNormalizeQuantityInput: normalizeQuantityInput,
          onAddToCart: handleAddToCart,
        }),
    });
  } else if (state.route?.name === "home") {
    renderHomeView(root, {
      attachHeaderNavigation: (root) =>
        attachHeaderNavigation(root, {
          onNavigateToHome: handleRouteChange,
          onCartIconClick: (event) => handleCartIconClick(event, openCartModalWrapper),
        }),
      initializeSearchSection: () =>
        initializeSearchSection({
          onSearchInputKeyDown: (event) => handleSearchInputKeyDown(event, loadProducts, updateHomeUrlParams),
          onSelectLimit: selectLimit,
          onSelectSort: selectSort,
          onCategoryBreadcrumbClick: (event) =>
            handleCategoryBreadcrumbClick(
              event,
              (event) => handleCategoryReset(event, updateSearchUI, loadProducts),
              (event) => handleCategoryBreadcrumb(event, updateSearchUI, loadProducts),
            ),
          onCategoryButtonsClick: (event) =>
            handleCategoryButtonsClick(
              event,
              (event) => handleCategory1Select(event, updateSearchUI, loadProducts),
              (event) => handleCategory2Select(event, updateSearchUI, loadProducts),
            ),
        }),
      updateSearchUI,
      renderProductSection: () =>
        renderProductSection({
          onAddToCart: handleAddToCart,
          onProductCardClick: (event) => handleProductCardClick(event, navigateToDetail),
          onRetry: () =>
            loadProductsService({ append: false }, render, () => showToast(errorAlert), updateHomeUrlParams),
          onLoadMoreRetry: () =>
            loadProductsService({ append: true }, render, () => showToast(errorAlert), updateHomeUrlParams),
        }),
      setupLoadMoreObserver: (root) =>
        setupLoadMoreObserver(root, () =>
          loadProductsService({ append: true }, render, () => showToast(errorAlert), updateHomeUrlParams),
        ),
    });
  } else {
    renderNotFound(root);
  }

  renderCartModalForCartWrapper();
}

function renderNotFound(root) {
  disconnectLoadMoreObserver();
  resetHomeShell();
  root.innerHTML = error404();
  attachHeaderNavigation(root, {
    onNavigateToHome: handleRouteChange,
    onCartIconClick: (event) => handleCartIconClick(event, openCartModalWrapper),
  });
}

function loadProducts({ append = false } = {}) {
  return loadProductsService({ append }, render, () => showToast(errorAlert), updateHomeUrlParams);
}

function navigateToDetail(productId) {
  navigateToDetailService(productId, handleRouteChange);
}

function navigateToHome({ replace = false, category1, category2, current, search } = {}) {
  navigateToHomeService({ replace, category1, category2, current, search }, buildHomeUrlWithParams, handleRouteChange);
}

function selectLimit(event) {
  const nextLimit = Number(event.target.value);
  if (Number.isNaN(nextLimit) || state.limit === nextLimit) {
    render();
    return;
  }

  // 개수 변경 시 기존 로딩 상태를 리셋하여 새로운 API 호출이 보장되도록 함
  state.isLoadingProducts = false;
  state.isLoadingMore = false;
  state.productsError = null;
  state.loadMoreError = null;
  state.products = []; // 이전 상품 목록 초기화 (페이지당 개수가 변경되므로)
  state.currentPage = 0;

  state.limit = nextLimit;
  state.limitTouched = true;
  state.urlTouched = true;
  updateHomeUrlParams({ current: 1, limit: nextLimit });
  loadProducts();
}

function selectSort(event) {
  const nextSort = event.target.value;
  if (!nextSort || state.sort === nextSort || state.route?.name !== "home") {
    render();
    return;
  }

  // 정렬 변경 시 기존 로딩 상태를 리셋하여 새로운 API 호출이 보장되도록 함
  state.isLoadingProducts = false;
  state.isLoadingMore = false;
  state.productsError = null;
  state.loadMoreError = null;
  state.products = []; // 이전 상품 목록 초기화 (정렬이 변경되므로)
  state.currentPage = 0;

  state.sort = nextSort;
  state.sortTouched = true;
  state.urlTouched = true;
  updateHomeUrlParams({ current: 1, sort: nextSort });
  loadProductsService({ append: false }, render, () => showToast(errorAlert), updateHomeUrlParams);
}

async function handleRouteChange() {
  closeCartModalWrapper();
  state.route = parseRoute();

  if (state.route.name === "detail") {
    await loadProductDetailService(state.route.params.productId, render, () => showToast(errorAlert));
    return;
  }

  if (state.route.name !== "home") {
    resetHomeShell();
    state.detail = createInitialDetailState();
    state.isLoadingProducts = false;
    state.productsError = null;
    render();
    return;
  }

  applyHomeQueryParams();
  state.detail = createInitialDetailState();

  // 초기 렌더링: 카테고리 로딩 상태(true)로 먼저 렌더링하여 "카테고리 로딩 중..."이 표시되도록 함
  // state.isLoadingCategories의 초기값이 true이므로 이 시점에 렌더링하면 로딩 메시지가 표시됨
  render();

  // 카테고리 로드 (비동기)
  await ensureCategoriesLoadedService(render, () => showToast(errorAlert));

  // URL 파라미터가 변경되었을 수 있으므로 항상 상품을 다시 로드
  // 이전에 로드된 상품이 있어도 새로운 필터 조건에 맞는 상품을 로드해야 함
  // loadProducts() 내부의 startInitialLoad()에서 상태 초기화가 이루어지므로 여기서는 초기화하지 않음
  await loadProductsService({ append: false }, render, () => showToast(errorAlert), updateHomeUrlParams);
}

async function main() {
  // 상태 초기화 (라우트와 장바구니 복원)
  initializeState(parseRoute());

  window.addEventListener("popstate", () => {
    handleRouteChange();
  });

  await handleRouteChange();
}

enableMocking().then(main);
