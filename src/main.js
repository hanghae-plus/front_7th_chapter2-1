import { getProducts, getProduct, getCategories } from "./api/productApi.js";
import { Home } from "./pages/home.js";
import { Detail } from "./pages/detail.js";
import { error404 } from "./pages/404.js";
import { Search, updateCategoryBreadcrumb, updateCategoryButtons, ItemList, Cart } from "./components/index.js";
import { addCartAlert, delCartAlert, errorAlert, showToast } from "./components/alert.js";

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
  searchTerm: "",
  isCartOpen: false,
  cartItems: {},
};

let loadMoreObserver = null;
let homeShellMounted = false;
let searchSectionInitialized = false;
let cartEscapeListenerAttached = false;
let cartModalEventsAttached = false;

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
    renderDetailView(root);
  } else if (state.route?.name === "home") {
    renderHomeView(root);
  } else {
    renderNotFound(root);
  }

  renderCartModal();
}

function renderDetailView(root) {
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
}

function renderHomeView(root) {
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

function renderNotFound(root) {
  disconnectLoadMoreObserver();
  homeShellMounted = false;
  searchSectionInitialized = false;
  root.innerHTML = error404();
  attachHeaderNavigation(root);
}

function initializeSearchSection() {
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

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = state.searchTerm;
    searchInput.addEventListener("keydown", handleSearchInputKeyDown);
  }

  const limitSelect = document.getElementById("limit-select");
  if (limitSelect) {
    limitSelect.addEventListener("change", selectLimit);
  }

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", selectSort);
  }

  const categoryBreadcrumb = document.getElementById("category-breadcrumb");
  if (categoryBreadcrumb) {
    categoryBreadcrumb.addEventListener("click", handleCategoryBreadcrumbClick);
  }

  const categoryButtons = document.getElementById("category-buttons");
  if (categoryButtons) {
    categoryButtons.addEventListener("click", handleCategoryButtonsClick);
  }
}

function updateSearchUI() {
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

function renderProductSection() {
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
      handleAddToCart(productId, 1);
    });
  });

  const retryButton = productContainer.querySelector("#products-retry-button");
  if (retryButton) {
    retryButton.addEventListener("click", () => loadProducts(), { once: true });
  }

  const loadMoreRetryButton = productContainer.querySelector("#products-load-more-retry-button");
  if (loadMoreRetryButton) {
    loadMoreRetryButton.addEventListener("click", () => loadProducts({ append: true }), {
      once: true,
    });
  }

  const productCards = productContainer.querySelectorAll(".product-card");
  productCards.forEach((card) => {
    card.addEventListener("click", handleProductCardClick);
  });
}

function handleCategoryBreadcrumbClick(event) {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  if (target.dataset.breadcrumb === "reset") {
    handleCategoryReset(event);
    return;
  }

  if (target.dataset.breadcrumb === "category1") {
    handleCategoryBreadcrumb(event);
    return;
  }
}

function handleCategoryButtonsClick(event) {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  if (target.dataset.category2) {
    handleCategory2Select(event);
    return;
  }

  if (target.dataset.category1) {
    handleCategory1Select(event);
  }
}

function attachDetailEvents(root) {
  attachHeaderNavigation(root);

  const backButtons = root.querySelectorAll('[data-navigate="home"]');
  backButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      resetFilters();
      navigateToHome({ replace: false });
    });
  });

  const detailBreadcrumb = root.querySelector(".detail-breadcrumb");
  if (detailBreadcrumb) {
    detailBreadcrumb.addEventListener("click", handleDetailBreadcrumbClick);
  }

  const relatedCards = root.querySelectorAll(".related-product-card");
  relatedCards.forEach((card) => {
    card.addEventListener("click", () => {
      const productId = card.dataset.productId;
      if (productId) {
        navigateToDetail(productId);
      }
    });
  });

  const decreaseButton = root.querySelector("[data-quantity-decrease]");
  const increaseButton = root.querySelector("[data-quantity-increase]");
  const quantityInput = root.querySelector("#quantity-input");
  const addToCartButton = root.querySelector(".add-to-cart");

  if (decreaseButton && quantityInput) {
    decreaseButton.addEventListener("click", () => adjustQuantity(quantityInput, -1));
  }

  if (increaseButton && quantityInput) {
    increaseButton.addEventListener("click", () => adjustQuantity(quantityInput, 1));
  }

  if (quantityInput) {
    quantityInput.addEventListener("input", () => normalizeQuantityInput(quantityInput));
  }

  if (addToCartButton && quantityInput) {
    addToCartButton.addEventListener("click", () =>
      handleAddToCart(addToCartButton.dataset.productId, quantityInput.value),
    );
  }
}

function handleDetailBreadcrumbClick(event) {
  const button = event.target.closest("[data-navigate]");
  if (!button) {
    return;
  }

  if (button.dataset.navigate === "home") {
    event.preventDefault();
    resetFilters({ updateUrl: false });
    navigateToHome({ replace: false });
    return;
  }

  if (button.dataset.navigate === "home-category") {
    event.preventDefault();
    const { category1, category2 } = button.dataset;
    resetFilters({ updateUrl: false });
    state.selectedCategory1 = category1 || null;
    state.selectedCategory2 = category2 || null;
    navigateToHome({
      category1: state.selectedCategory1,
      category2: state.selectedCategory2,
      current: 1,
      search: null,
    });
  }
}

function resetFilters({ updateUrl = true } = {}) {
  state.selectedCategory1 = null;
  state.selectedCategory2 = null;
  state.searchTerm = "";
  state.currentPage = 0;
  if (updateUrl && state.route?.name === "home") {
    updateHomeUrlParams({ current: 1, category1: null, category2: null, search: null });
  }
}

function attachHeaderNavigation(root) {
  const homeLinks = root.querySelectorAll("[data-link]");
  homeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      resetFilters({ updateUrl: false });
      navigateToHome({ replace: false });
    });
  });

  const cartButton = root.querySelector("#cart-icon-btn");
  if (cartButton) {
    cartButton.addEventListener("click", handleCartIconClick);
  }
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
    showToast(errorAlert);
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
  const detailUrl = buildUrl(`product/${encodeURIComponent(productId)}`);
  window.history.pushState({ productId }, "", detailUrl.toString());
  handleRouteChange();
}

function navigateToHome({ replace = false, category1, category2, current, search } = {}) {
  const url = buildHomeUrlWithParams({
    current,
    category1,
    category2,
    search,
  });

  if (replace) {
    window.history.replaceState({}, "", url.toString());
  } else {
    window.history.pushState({}, "", url.toString());
  }

  handleRouteChange();
}

function handleCategory1Select(event) {
  event.preventDefault();
  const button = event.target.closest("[data-category1]");
  if (!button) {
    return;
  }
  const { category1 } = button.dataset;
  if (!category1) {
    return;
  }

  const changed = state.selectedCategory1 !== category1 || state.selectedCategory2 !== null;
  state.selectedCategory1 = category1;
  state.selectedCategory2 = null;

  if (changed) {
    updateHomeUrlParams({ current: 1, category1, category2: null });
    loadProducts();
  } else {
    updateSearchUI();
  }
}

function handleCategory2Select(event) {
  event.preventDefault();
  const button = event.target.closest("[data-category2]");
  if (!button) {
    return;
  }
  const { category1, category2 } = button.dataset;
  if (!category1 || !category2) {
    return;
  }

  const changed = state.selectedCategory1 !== category1 || state.selectedCategory2 !== category2;
  state.selectedCategory1 = category1;
  state.selectedCategory2 = category2;

  if (changed) {
    updateHomeUrlParams({ current: 1, category1, category2 });
    loadProducts();
  } else {
    updateSearchUI();
  }
}

function handleCategoryReset(event) {
  event.preventDefault();
  const button = event.target.closest('[data-breadcrumb="reset"]');
  if (!button) {
    return;
  }

  const changed = state.selectedCategory1 !== null || state.selectedCategory2 !== null || state.searchTerm !== "";
  if (!changed) {
    updateSearchUI();
    return;
  }

  resetFilters({ updateUrl: false });
  updateHomeUrlParams({ current: 1, category1: null, category2: null, search: null });
  loadProducts();
}

function handleCategoryBreadcrumb(event) {
  event.preventDefault();
  const button = event.target.closest('[data-breadcrumb="category1"]');
  if (!button) {
    return;
  }

  const { category1 } = button.dataset;
  const targetCategory = category1 || null;
  const changed =
    state.selectedCategory1 !== targetCategory || state.selectedCategory2 !== null || state.searchTerm !== "";

  state.selectedCategory1 = targetCategory;
  state.selectedCategory2 = null;

  if (changed) {
    updateHomeUrlParams({ current: 1, category1: targetCategory, category2: null, search: state.searchTerm });
    loadProducts();
  } else {
    updateSearchUI();
  }
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
  return await getProducts({
    limit: state.limit,
    page,
    sort: state.sort,
    ...(state.selectedCategory1 ? { category1: state.selectedCategory1 } : {}),
    ...(state.selectedCategory2 ? { category2: state.selectedCategory2 } : {}),
    ...(state.searchTerm ? { search: state.searchTerm } : {}),
  });
}

function handleSearchInputKeyDown(event) {
  if (event.key !== "Enter") {
    return;
  }
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) {
    return;
  }
  event.preventDefault();
  const nextTerm = input.value.trim();
  if (state.searchTerm === nextTerm) {
    return;
  }
  state.searchTerm = nextTerm;
  updateHomeUrlParams({
    current: 1,
    category1: state.selectedCategory1,
    category2: state.selectedCategory2,
    search: nextTerm || null,
  });
  loadProducts();
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

  if (state.route?.name === "home") {
    updateHomeUrlParams({
      current: state.currentPage,
      category1: state.selectedCategory1,
      category2: state.selectedCategory2,
    });
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

    let relatedProducts = [];
    try {
      if (product.category1) {
        const relatedResponse = await getProducts({
          limit: 12,
          category1: product.category1,
          ...(product.category2 ? { category2: product.category2 } : {}),
        });
        relatedProducts = (relatedResponse?.products ?? [])
          .filter((item) => item.productId !== product.productId)
          .slice(0, 4);
      }
    } catch (relatedError) {
      console.error("관련 상품을 불러오지 못했습니다.", relatedError);
      relatedProducts = [];
    }

    state.detail.product = {
      ...product,
      relatedProducts,
    };
  } catch (error) {
    if (state.route?.name !== "detail" || state.route.params.productId !== productId) {
      return;
    }
    console.error("상품 상세 정보를 불러오지 못했습니다.", error);
    state.detail.error = DETAIL_LOAD_ERROR_MESSAGE;
    showToast(errorAlert);
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

  const detailMatch = pathname.match(/^product\/([^/]+)$/);
  if (detailMatch) {
    return {
      name: "detail",
      params: {
        productId: decodeURIComponent(detailMatch[1]),
      },
    };
  }

  return { name: "not_found" };
}

function buildUrl(path = "") {
  const basePath = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(`${normalizedBase}${normalizedPath}`, window.location.origin);
}

async function handleRouteChange() {
  closeCartModal();
  state.route = parseRoute();

  if (state.route.name === "detail") {
    await loadProductDetail(state.route.params.productId);
    return;
  }

  if (state.route.name !== "home") {
    homeShellMounted = false;
    searchSectionInitialized = false;
    state.detail = createInitialDetailState();
    state.isLoadingProducts = false;
    state.productsError = null;
    render();
    return;
  }

  applyHomeQueryParams();
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
  if (state.route?.name === "home") {
    render();
  }

  try {
    const categories = await getCategories();
    state.categories = categories ?? {};
    state.categoriesLoaded = true;
  } catch (error) {
    console.error("카테고리 정보를 불러오지 못했습니다.", error);
    state.categories = {};
    state.categoriesLoaded = false;
    showToast(errorAlert);
  } finally {
    state.isLoadingCategories = false;
    if (state.route?.name === "home") {
      render();
    }
  }
}

function handleCartIconClick(event) {
  event.preventDefault();
  openCartModal();
}

function openCartModal() {
  state.isCartOpen = true;
  renderCartModal();
}

function closeCartModal() {
  if (!state.isCartOpen) {
    return;
  }
  state.isCartOpen = false;
  renderCartModal();
}

function getCartItemsArray() {
  return Object.values(state.cartItems ?? {});
}

function getCartSummary() {
  const items = getCartItemsArray();
  const totalCount = items.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + (Number(item?.product?.lprice) || 0) * (item?.quantity ?? 0), 0);
  const selectedItems = items.filter((item) => item?.selected);
  const selectedCount = selectedItems.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);
  const selectedPrice = selectedItems.reduce(
    (sum, item) => sum + (Number(item?.product?.lprice) || 0) * (item?.quantity ?? 0),
    0,
  );
  return { items, totalCount, totalPrice, selectedCount, selectedPrice };
}

function updateCartBadge(providedCount) {
  const badge = document.getElementById("cart-count-badge");
  if (!badge) {
    return;
  }
  const count = providedCount ?? getCartSummary().totalCount;
  if (count > 0) {
    badge.textContent = String(count);
    badge.classList.remove("hidden");
  } else {
    badge.textContent = "";
    badge.classList.add("hidden");
  }
}

function renderCartModal() {
  const existing = document.getElementById("cart-modal-root");
  if (!state.isCartOpen) {
    if (existing) {
      existing.remove();
    }
    detachCartEscapeListener();
    cartModalEventsAttached = false;
    updateCartBadge();
    return;
  }

  const { items, totalCount, totalPrice, selectedCount, selectedPrice } = getCartSummary();

  let container = existing;
  if (!container) {
    container = document.createElement("div");
    container.id = "cart-modal-root";
    document.body.appendChild(container);
  }

  container.innerHTML = Cart({ items, totalCount, totalPrice, selectedCount, selectedPrice });

  attachCartModalEvents(container);
  attachCartEscapeListener();
  updateCartBadge(totalCount);
}

function attachCartModalEvents(container) {
  if (cartModalEventsAttached) {
    return;
  }

  container.addEventListener("click", handleCartModalClick);
  container.addEventListener("change", handleCartModalChange);
  cartModalEventsAttached = true;
}

function handleCartKeydown(event) {
  if (event.key === "Escape") {
    closeCartModal();
  }
}

function attachCartEscapeListener() {
  if (cartEscapeListenerAttached) {
    return;
  }
  document.addEventListener("keydown", handleCartKeydown);
  cartEscapeListenerAttached = true;
}

function detachCartEscapeListener() {
  if (!cartEscapeListenerAttached) {
    return;
  }
  document.removeEventListener("keydown", handleCartKeydown);
  cartEscapeListenerAttached = false;
}

function handleCartModalClick(event) {
  const actionButton = event.target.closest("[data-cart-action]");
  if (!actionButton) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const { cartAction, cartProductId } = actionButton.dataset;
  switch (cartAction) {
    case "close":
      closeCartModal();
      break;
    case "increase":
      if (cartProductId) {
        incrementCartItem(cartProductId);
      }
      break;
    case "decrease":
      if (cartProductId) {
        decrementCartItem(cartProductId);
      }
      break;
    case "remove":
      if (cartProductId) {
        removeCartItem(cartProductId);
      }
      break;
    case "remove-selected":
      removeSelectedCartItems();
      break;
    case "clear":
      clearCartItems();
      break;
    case "checkout":
      checkoutCart();
      break;
    default:
      break;
  }
}

function handleCartModalChange(event) {
  const checkbox = event.target.closest(".cart-item-checkbox");
  if (checkbox) {
    handleCartCheckboxToggle(checkbox);
    return;
  }

  const selectAll = event.target.closest(".cart-select-all-checkbox");
  if (selectAll) {
    handleCartSelectAllChange(selectAll.checked);
  }
}

function handleCartCheckboxToggle(checkbox) {
  const productId = checkbox.dataset.productId;
  if (!productId || !state.cartItems[productId]) {
    return;
  }

  state.cartItems[productId].selected = checkbox.checked;
  renderCartModal();
}

function handleCartSelectAllChange(checked) {
  Object.keys(state.cartItems).forEach((productId) => {
    state.cartItems[productId].selected = checked;
  });
  renderCartModal();
}

function removeSelectedCartItems() {
  const before = Object.keys(state.cartItems).length;
  Object.keys(state.cartItems).forEach((productId) => {
    if (state.cartItems[productId]?.selected) {
      delete state.cartItems[productId];
    }
  });
  if (Object.keys(state.cartItems).length !== before) {
    renderCartModal();
    showToast(delCartAlert);
  }
}

function clearCartItems() {
  if (Object.keys(state.cartItems).length === 0) {
    return;
  }
  state.cartItems = {};
  renderCartModal();
  showToast(delCartAlert);
}

function checkoutCart() {
  const { selectedCount, selectedPrice } = getCartSummary();
  if (selectedCount === 0) {
    console.info("선택된 상품이 없습니다.");
    return;
  }
  console.info(`선택한 ${selectedCount}개의 상품, 총 ${selectedPrice}원 결제 진행 (모의).`);
}

function incrementCartItem(productId) {
  const item = state.cartItems[productId];
  if (!item) {
    return;
  }
  item.quantity += 1;
  renderCartModal();
}

function decrementCartItem(productId) {
  const item = state.cartItems[productId];
  if (!item) {
    return;
  }

  if (item.quantity <= 1) {
    delete state.cartItems[productId];
    showToast(delCartAlert);
  } else {
    item.quantity -= 1;
  }

  renderCartModal();
}

function removeCartItem(productId) {
  if (!state.cartItems[productId]) {
    return;
  }
  delete state.cartItems[productId];
  renderCartModal();
  showToast(delCartAlert);
}

function applyHomeQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const category1 = params.get("category1");
  const category2 = params.get("category2");
  const search = params.get("search") ?? "";

  state.selectedCategory1 = category1 || null;
  state.selectedCategory2 = category2 || null;
  state.searchTerm = search;
}

function updateHomeUrlParams({ current, category1, category2, search } = {}) {
  if (state.route?.name !== "home") {
    return;
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;

  if (current !== undefined) {
    const parsedCurrent = Number(current);
    if (Number.isFinite(parsedCurrent) && parsedCurrent > 1) {
      params.set("current", String(parsedCurrent));
    } else {
      params.delete("current");
    }
  }

  if (category1 !== undefined) {
    if (category1) {
      params.set("category1", category1);
    } else {
      params.delete("category1");
    }
  }

  if (category2 !== undefined) {
    if (category2) {
      params.set("category2", category2);
    } else {
      params.delete("category2");
    }
  }

  if (search !== undefined) {
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
  }

  url.search = params.toString();
  window.history.replaceState(window.history.state, "", url.toString());
}

function buildHomeUrlWithParams({ current, category1, category2, search } = {}) {
  const url = buildUrl("");
  const params = url.searchParams;

  if (current !== undefined) {
    const parsedCurrent = Number(current);
    if (Number.isFinite(parsedCurrent) && parsedCurrent > 1) {
      params.set("current", String(parsedCurrent));
    } else {
      params.delete("current");
    }
  }

  if (category1 !== undefined) {
    if (category1) {
      params.set("category1", category1);
    } else {
      params.delete("category1");
    }
  }

  if (category2 !== undefined) {
    if (category2) {
      params.set("category2", category2);
    } else {
      params.delete("category2");
    }
  }

  if (search !== undefined) {
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
  }

  url.search = params.toString();
  return url;
}

function adjustQuantity(input, delta) {
  const current = Number(input.value) || 1;
  const min = Number(input.min) || 1;
  const max = Number(input.max) || Infinity;
  const next = Math.min(Math.max(current + delta, min), max);
  input.value = String(next);
}

function normalizeQuantityInput(input) {
  const min = Number(input.min) || 1;
  const max = Number(input.max) || Infinity;
  let value = Number(input.value);
  if (!Number.isFinite(value)) {
    value = min;
  }
  value = Math.min(Math.max(value, min), max);
  input.value = String(value);
}

function handleAddToCart(productId, quantity) {
  if (!productId) {
    return;
  }

  const amount = Math.max(1, Number(quantity) || 1);
  const product = findProductForCart(productId);
  if (!product) {
    console.warn("상품 정보를 찾을 수 없어 장바구니에 담지 못했습니다.", productId);
    showToast(errorAlert);
    return;
  }

  const price = Number(product.lprice ?? product.price ?? 0);
  const stored = state.cartItems[productId];
  if (!stored) {
    state.cartItems[productId] = {
      product: {
        productId,
        title: product.title ?? "",
        image: product.image ?? "",
        lprice: price,
      },
      quantity: 0,
      selected: false,
    };
  }

  state.cartItems[productId].quantity += amount;
  updateCartBadge();
  showToast(addCartAlert);
}

function findProductForCart(productId) {
  const fromList = state.products.find((item) => item?.productId === productId);
  if (fromList) {
    return fromList;
  }

  if (state.detail?.product?.productId === productId) {
    return state.detail.product;
  }

  return state.cartItems[productId]?.product ?? null;
}
