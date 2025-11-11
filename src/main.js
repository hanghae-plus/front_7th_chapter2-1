import { getProducts, getProduct, getCategories } from "./api/productApi.js";
import { Home } from "./pages/home.js";
import { Detail } from "./pages/detail.js";

const INITIAL_LOAD_ERROR_MESSAGE = "상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
const LOAD_MORE_ERROR_MESSAGE = "상품을 추가로 불러오지 못했습니다. 다시 시도해 주세요.";
const DETAIL_LOAD_ERROR_MESSAGE = "상품 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

function createInitialDetailState() {
  return {
    isLoading: false,
    error: null,
    product: null,
  };
}

const state = {
  products: [],
  isLoadingProducts: false,
  isLoadingMore: false,
  productsError: null,
  loadMoreError: null,
  limit: 20,
  currentPage: 0,
  hasMoreProducts: true,
  sort: "price_asc",
  totalProducts: 0,
  categories: {},
  categoriesLoaded: false,
  isLoadingCategories: false,
  route: null,
  detail: createInitialDetailState(),
  selectedCategory1: null,
  selectedCategory2: null,
};

let loadMoreObserver = null;

const enableMocking = async () => {
  const { worker } = await import("./mocks/browser.js");

  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
};

state.route = parseRoute();

function render() {
  const root = document.getElementById("root");
  if (!root) return;

  if (state.route?.name === "detail") {
    disconnectLoadMoreObserver();
    root.innerHTML = Detail({
      navProps: {
        product: state.detail.product,
        loading: state.detail.isLoading,
      },
      contentProps: {
        product: state.detail.product,
        loading: state.detail.isLoading,
        error: state.detail.error,
      },
    });
    attachDetailEvents(root);
    return;
  }

  root.innerHTML = Home({
    searchProps: {
      loading: state.isLoadingProducts || state.isLoadingCategories,
      limit: state.limit,
      sort: state.sort,
      selectedCategory1: state.selectedCategory1,
      selectedCategory2: state.selectedCategory2,
      categories: state.categories,
    },
    productProps: {
      loading: state.isLoadingProducts,
      loadingMore: state.isLoadingMore,
      products: state.products,
      error: state.productsError,
      hasMore: state.hasMoreProducts,
      loadMoreError: state.loadMoreError,
      totalCount: state.totalProducts,
    },
  });

  attachHomeEvents(root);
  setupLoadMoreObserver(root);
}

function attachHomeEvents(root) {
  attachHeaderNavigation(root);

  const limitSelect = root.querySelector("#limit-select");
  if (limitSelect) {
    limitSelect.value = String(state.limit);
    limitSelect.addEventListener("change", selectLimit, { once: true });
  }

  const sortSelect = root.querySelector("#sort-select");
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener("change", selectSort, { once: true });
  }

  const retryButton = root.querySelector("#products-retry-button");
  if (retryButton) {
    retryButton.addEventListener(
      "click",
      () => {
        loadProducts();
      },
      { once: true },
    );
  }

  const loadMoreRetryButton = root.querySelector("#products-load-more-retry-button");
  if (loadMoreRetryButton) {
    loadMoreRetryButton.addEventListener(
      "click",
      () => {
        loadProducts({ append: true });
      },
      { once: true },
    );
  }

  const productCards = root.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", handleProductCardClick);
  });

  const categoryRootButtons = root.querySelectorAll(".category1-filter-btn");
  categoryRootButtons.forEach((button) => button.addEventListener("click", handleCategory1Select));

  const categorySecondButtons = root.querySelectorAll(".category2-filter-btn");
  categorySecondButtons.forEach((button) => button.addEventListener("click", handleCategory2Select));

  const resetButtons = root.querySelectorAll('[data-breadcrumb="reset"]');
  resetButtons.forEach((button) => button.addEventListener("click", handleCategoryReset));

  const breadcrumbCategoryButtons = root.querySelectorAll('[data-breadcrumb="category1"]');
  breadcrumbCategoryButtons.forEach((button) => button.addEventListener("click", handleCategoryBreadcrumb));
}

function attachDetailEvents(root) {
  attachHeaderNavigation(root);

  const backButtons = root.querySelectorAll('[data-navigate="home"]');
  backButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToHome();
    });
  });
}

function attachHeaderNavigation(root) {
  const homeLinks = root.querySelectorAll("[data-link]");
  homeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToHome();
    });
  });
}

function setupLoadMoreObserver(rootElement) {
  if (state.route?.name !== "home") {
    disconnectLoadMoreObserver();
    return;
  }

  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
    loadMoreObserver = null;
  }

  if (state.loadMoreError) {
    return;
  }

  const sentinel = rootElement.querySelector("#products-load-more-trigger");
  if (!sentinel) {
    return;
  }

  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadProducts({ append: true });
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0,
    },
  );

  loadMoreObserver.observe(sentinel);
}

function disconnectLoadMoreObserver() {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
    loadMoreObserver = null;
  }
}

async function loadProducts({ append = false } = {}) {
  if (state.route?.name !== "home") {
    return;
  }

  const context = append ? startAppendLoad() : startInitialLoad();
  if (!context) {
    return;
  }

  const { nextPage } = context;

  try {
    const data = await fetchProductPage(nextPage);
    applyProductResponse(data, { append, requestedPage: nextPage });
  } catch (error) {
    console.error("상품 목록을 불러오지 못했습니다.", error);
    handleLoadError(append);
  } finally {
    finishLoad(append);
  }
}

function handleProductCardClick(event) {
  if (event.target.closest(".add-to-cart-btn")) {
    event.stopPropagation();
    return;
  }

  const card = event.currentTarget;
  const productId = card.dataset.productId;

  if (!productId) {
    return;
  }

  navigateToDetail(productId);
}

function navigateToDetail(productId) {
  const detailUrl = buildUrl(`item/${encodeURIComponent(productId)}`);
  window.history.pushState({ productId }, "", detailUrl.toString());
  handleRouteChange();
}

function navigateToHome({ replace = false } = {}) {
  const homeUrl = buildUrl("");
  if (replace) {
    window.history.replaceState({}, "", homeUrl.toString());
  } else {
    window.history.pushState({}, "", homeUrl.toString());
  }
  handleRouteChange();
}

function handleCategory1Select(event) {
  event.preventDefault();
  const { category1 } = event.currentTarget.dataset;
  if (!category1) {
    return;
  }

  state.selectedCategory1 = category1;
  state.selectedCategory2 = null;
  render();
}

function handleCategory2Select(event) {
  event.preventDefault();
  const { category1, category2 } = event.currentTarget.dataset;
  if (!category1 || !category2) {
    return;
  }

  state.selectedCategory1 = category1;
  state.selectedCategory2 = category2;
  render();
}

function handleCategoryReset(event) {
  event.preventDefault();
  if (!state.selectedCategory1 && !state.selectedCategory2) {
    return;
  }

  state.selectedCategory1 = null;
  state.selectedCategory2 = null;
  render();
}

function handleCategoryBreadcrumb(event) {
  event.preventDefault();
  const { category1 } = event.currentTarget.dataset;
  state.selectedCategory1 = category1 || null;
  state.selectedCategory2 = null;
  render();
}

function selectLimit(event) {
  const nextLimit = Number(event.target.value);
  if (Number.isNaN(nextLimit) || state.limit === nextLimit) {
    render();
    return;
  }

  state.limit = nextLimit;
  loadProducts();
}

function selectSort(event) {
  const nextSort = event.target.value;
  if (!nextSort || state.sort === nextSort || state.route?.name !== "home") {
    render();
    return;
  }

  state.sort = nextSort;
  loadProducts();
}

function startInitialLoad() {
  if (state.isLoadingProducts) {
    return null;
  }

  state.isLoadingProducts = true;
  state.productsError = null;
  state.loadMoreError = null;
  state.currentPage = 0;
  state.hasMoreProducts = true;
  state.totalProducts = 0;
  render();

  return { nextPage: 1 };
}

function startAppendLoad() {
  if (state.route?.name !== "home" || state.isLoadingProducts || state.isLoadingMore || !state.hasMoreProducts) {
    return null;
  }

  state.isLoadingMore = true;
  state.loadMoreError = null;
  render();

  return { nextPage: state.currentPage + 1 };
}

async function fetchProductPage(page) {
  return await getProducts({ limit: state.limit, page, sort: state.sort });
}

function applyProductResponse(data, { append, requestedPage }) {
  const incomingProducts = data?.products ?? [];
  const resolvedPage = data?.pagination?.page ?? requestedPage;
  const hasNext = data?.pagination?.hasNext ?? incomingProducts.length >= state.limit;
  const totalCount = data?.pagination?.total;

  state.products = append ? [...state.products, ...incomingProducts] : incomingProducts;
  state.currentPage = resolvedPage;
  state.hasMoreProducts = hasNext;
  if (typeof totalCount === "number") {
    state.totalProducts = totalCount;
  } else if (!append) {
    state.totalProducts = state.products.length;
  }
}

function handleLoadError(append) {
  if (append) {
    state.loadMoreError = LOAD_MORE_ERROR_MESSAGE;
    return;
  }

  state.productsError = INITIAL_LOAD_ERROR_MESSAGE;
}

function finishLoad(append) {
  if (append) {
    state.isLoadingMore = false;
  } else {
    state.isLoadingProducts = false;
  }

  render();
}

async function loadProductDetail(productId) {
  state.detail = createInitialDetailState();
  state.detail.isLoading = true;
  render();

  try {
    const product = await getProduct(productId);
    if (state.route?.name !== "detail" || state.route.params.productId !== productId) {
      return;
    }
    state.detail.product = product;
  } catch (error) {
    if (state.route?.name !== "detail" || state.route.params.productId !== productId) {
      return;
    }
    console.error("상품 상세 정보를 불러오지 못했습니다.", error);
    state.detail.error = DETAIL_LOAD_ERROR_MESSAGE;
  } finally {
    if (state.route?.name === "detail" && state.route.params.productId === productId) {
      state.detail.isLoading = false;
      render();
    }
  }
}

function parseRoute() {
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  let pathname = window.location.pathname;

  if (normalizedBase !== "/" && pathname.startsWith(normalizedBase)) {
    pathname = pathname.slice(normalizedBase.length);
  } else if (normalizedBase === "/" && pathname.startsWith("/")) {
    pathname = pathname.slice(1);
  }

  pathname = pathname.replace(/^\/+/, "").replace(/\/+$/, "");

  if (!pathname) {
    return { name: "home" };
  }

  const detailMatch = pathname.match(/^item\/([^/]+)$/);
  if (detailMatch) {
    return {
      name: "detail",
      params: {
        productId: decodeURIComponent(detailMatch[1]),
      },
    };
  }

  return { name: "home" };
}

function buildUrl(path = "") {
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);
}

async function handleRouteChange() {
  state.route = parseRoute();

  if (state.route.name === "detail") {
    await loadProductDetail(state.route.params.productId);
    return;
  }

  state.detail = createInitialDetailState();
  await ensureCategoriesLoaded();

  if (!state.products.length) {
    await loadProducts();
    return;
  }

  state.isLoadingProducts = false;
  state.productsError = null;
  render();
}

async function main() {
  window.addEventListener("popstate", () => {
    handleRouteChange();
  });

  await handleRouteChange();
}

enableMocking().then(main);

async function ensureCategoriesLoaded() {
  if (state.categoriesLoaded || state.isLoadingCategories) {
    return;
  }

  state.isLoadingCategories = true;
  try {
    const categories = await getCategories();
    state.categories = normalizeCategories(categories);
    state.categoriesLoaded = true;
  } catch (error) {
    console.error("카테고리 정보를 불러오지 못했습니다.", error);
    state.categories = {};
    state.categoriesLoaded = false;
  } finally {
    state.isLoadingCategories = false;
  }
}

function normalizeCategories(categories = {}) {
  return Object.fromEntries(
    Object.entries(categories ?? {}).map(([category1, children]) => [
      category1,
      Object.keys(children ?? {}).sort((a, b) => a.localeCompare(b, "ko")),
    ]),
  );
}
