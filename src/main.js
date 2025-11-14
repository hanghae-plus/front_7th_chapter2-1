import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { ProductList } from "./components/product/ProductList.js";
import { showToast } from "./components/toast/Toast.js";
import { closeCartModal, openCartModal } from "./pages/CartModal.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { cartStore } from "./store/cartStore.js";
import { updateCategoryUI } from "./utils/categoryUI.js";
import { findRoute, initRouter, push } from "./utils/router.js";
import {
  clearCartSelection,
  getSelectedCartProductIds,
  selectAllCartItems,
  toggleCartItemSelection,
} from "./components/cart/CartList.js";

const enableMocking = () => {
  const workerScriptUrl = `${import.meta.env.BASE_URL ?? "/"}mockServiceWorker.js`;
  return import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: workerScriptUrl,
      },
      onUnhandledRequest: "bypass",
    }),
  );
};
const productCache = new Map();
const normalizePath = (path = "/") => (path.endsWith("/") ? path : `${path}/`);
const BASE_PATH = normalizePath(import.meta.env.BASE_URL || "/");

const DEFAULT_LIMIT = 20;
const infiniteScrollState = {
  currentPage: 1,
  isLoading: false,
  hasMore: true,
  accumulatedProducts: [],
  totalCount: 0,
  filters: {
    search: "",
    category1: "",
    category2: "",
    limit: DEFAULT_LIMIT,
    sort: "price_asc",
  },
};

let selectedCat1 = null;
let selectedCat2 = null;

const isHomeRoute = () => normalizePath(location.pathname) === BASE_PATH;

const buildFilterParams = ({ search = "", limit = DEFAULT_LIMIT, sort = "price_asc" }) => ({
  search,
  category1: selectedCat1 ?? "",
  category2: selectedCat2 ?? "",
  limit,
  sort,
});

const initializeProductListState = ({ response, filters, shouldRender = false }) => {
  if (!response) return;
  const { products = [], pagination } = response;
  infiniteScrollState.accumulatedProducts = [...products];
  infiniteScrollState.currentPage = pagination?.page ?? 1;
  infiniteScrollState.hasMore = pagination?.hasNext ?? products.length > 0;
  infiniteScrollState.totalCount = pagination?.total ?? products.length;
  infiniteScrollState.isLoading = false;
  infiniteScrollState.filters = { ...filters };

  products.forEach((product) => {
    productCache.set(product.productId, product);
  });

  if (shouldRender) {
    updateProductListDOM();
  }
};

const updateProductListDOM = () => {
  const $productListContainer = document.querySelector("#product-container");
  if (!$productListContainer) return;
  $productListContainer.outerHTML = ProductList({
    loading: false,
    products: infiniteScrollState.accumulatedProducts,
    hasMore: infiniteScrollState.hasMore,
    totalCount: infiniteScrollState.totalCount,
  });
};

const showInfiniteScrollLoading = (isVisible) => {
  const existing = document.getElementById("infinite-scroll-loading");
  if (!isVisible) {
    if (existing) existing.remove();
    return;
  }

  if (existing) return;

  const container = document.querySelector("#product-container");
  if (!container) return;

  const loader = document.createElement("div");
  loader.id = "infinite-scroll-loading";
  loader.className = "text-center py-4 text-sm text-gray-500";
  loader.textContent = "상품을 불러오는 중...";
  container.appendChild(loader);
};

const loadNextPage = async () => {
  if (!isHomeRoute()) return;
  if (infiniteScrollState.isLoading || !infiniteScrollState.hasMore) return;

  infiniteScrollState.isLoading = true;
  showInfiniteScrollLoading(true);
  const nextPage = infiniteScrollState.currentPage + 1;

  try {
    const response = await getProducts({
      ...infiniteScrollState.filters,
      page: nextPage,
    });
    const nextProducts = response?.products ?? [];
    if (nextProducts.length === 0) {
      infiniteScrollState.hasMore = false;
      return;
    }
    nextProducts.forEach((product) => {
      productCache.set(product.productId, product);
    });

    infiniteScrollState.accumulatedProducts = [...infiniteScrollState.accumulatedProducts, ...nextProducts];
    infiniteScrollState.currentPage = response?.pagination?.page ?? nextPage;
    infiniteScrollState.hasMore = response?.pagination?.hasNext ?? false;
    infiniteScrollState.totalCount = response?.pagination?.total ?? infiniteScrollState.totalCount;
    updateProductListDOM();
  } catch (error) {
    console.error("무한 스크롤 상품 로드 실패:", error);
  } finally {
    infiniteScrollState.isLoading = false;
    showInfiniteScrollLoading(false);
  }
};

const render = async () => {
  const $root = document.querySelector("#root");

  const match = findRoute(location.pathname);
  console.log("main.js", location.pathname, match?.route, match?.params);

  if (!match) {
    $root.innerHTML = NotFoundPage();
    return;
  }

  const { route, params } = match;

  if (route.path === "/") {
    $root.innerHTML = route.component({ loading: true });
    const query = new URLSearchParams(location.search);
    selectedCat1 = query.get("category1") || null;
    selectedCat2 = query.get("category2") || null;
    const search = query.get("search") || "";
    const limit = Number(query.get("limit")) || DEFAULT_LIMIT;
    const sort = query.get("sort") || "price_asc";
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts({ search: search, category1: selectedCat1, category2: selectedCat2, limit, sort }),
    ]);

    initializeProductListState({
      response: products,
      filters: buildFilterParams({ search, limit, sort }),
    });
    $root.innerHTML = route.component({
      categories,
      products,
      loading: false,
    });
  } else if (route.path === "/product/:id") {
    $root.innerHTML = route.component({ loading: true });
    const productId = params[0];
    const data = await getProduct(productId);
    if (!data || data.error) {
      $root.innerHTML = NotFoundPage();
      return;
    }
    const related = await getProducts({ category2: data.category2, limit: 13 });
    related.products = related.products.filter((p) => p.productId !== data.productId);
    $root.innerHTML = route.component({ product: data, relatedProducts: related.products });
  }
};
const refreshProducts = async () => {
  const query = new URLSearchParams(location.search);
  const search = query.get("search") || "";
  const limit = Number(query.get("limit"));
  const sort = query.get("sort") || "price_asc";
  const [products] = await Promise.all([
    getProducts({ search, category1: selectedCat1, category2: selectedCat2, limit, sort }),
  ]);

  initializeProductListState({
    response: products,
    filters: buildFilterParams({ search, limit, sort }),
    shouldRender: true,
  });
};

const pushWithNoRender = ({ path, selectedCat1 = null, selectedCat2 = null }) => {
  const currentRoute = findRoute(location.pathname)?.route;
  const isHome = currentRoute?.path === "/";
  push(path, { silent: isHome });
  if (isHome) {
    refreshProducts();
    updateCategoryUI(selectedCat1, selectedCat2);
  }
};
/* 이벤트 등록 영역 */
// 통합 클릭 이벤트 핸들러
document.body.addEventListener("click", (e) => {
  const target = e.target;

  //장바구니 이동
  const openCartModalBtn = target.closest("#cart-icon-btn");
  if (openCartModalBtn) {
    e.preventDefault();
    openCartModal();
    return;
  }
  const closeCartModalBtn = target.closest("#cart-modal-close-btn");
  const closeCartOverlay = target.closest(".cart-modal-overlay");
  const closeCart = closeCartModalBtn || closeCartOverlay;
  if (closeCart) {
    e.preventDefault();
    closeCartModal();
    return;
  }

  // 장바구니 추가 버튼 클릭
  const addToCartBtnMain = target.closest(".add-to-cart-btn");
  const addToCartBtnDetail = target.closest("#add-to-cart-btn");
  const addToCartBtn = addToCartBtnDetail || addToCartBtnMain;

  if (addToCartBtn) {
    e.stopPropagation();
    const product = productCache.get(addToCartBtn.dataset.productId);

    const quantityInput = document.getElementById("quantity-input");
    const quantity = quantityInput ? Math.max(1, Number(quantityInput.value) || 1) : 1;

    cartStore.addToCart({ ...product, quantity });
    showToast("addCart");
    return;
  }

  // 장바구니 갯수 변경
  const cartIncreaseBtn = target.closest(".quantity-increase-btn");
  const cartDecreaseBtn = target.closest(".quantity-decrease-btn");
  if (cartIncreaseBtn) {
    const productId = cartIncreaseBtn.dataset.productId;
    cartStore.addToCart({ productId: productId });
  }
  if (cartDecreaseBtn) {
    const productId = cartDecreaseBtn.dataset.productId;
    cartStore.decreaseQuantity(productId);
  }

  const cartQuantityIncreaseBtn = target.closest("#quantity-increase");
  const cartQuantityDecreaseBtn = target.closest("#quantity-decrease");
  if (cartQuantityIncreaseBtn) {
    const quantityInput = document.getElementById("quantity-input");
    quantityInput.value = Number(quantityInput.value) + 1;
  }
  if (cartQuantityDecreaseBtn) {
    const quantityInput = document.getElementById("quantity-input");
    quantityInput.value = Math.max(1, Number(quantityInput.value) - 1);
  }

  // 장바구니 삭제(선택, 전체)
  const cartRemoveBtn = target.closest("#cart-modal-remove-selected-btn");
  if (cartRemoveBtn) {
    const selectedProductIds = getSelectedCartProductIds();
    if (selectedProductIds.length > 0) {
      cartStore.removeProducts(selectedProductIds);
    }
  }

  const cartClear = target.closest("#cart-modal-clear-cart-btn");
  if (cartClear) {
    cartStore.clearCart();
    clearCartSelection();
  }

  //상품 카드 클릭
  const productCard = target.closest(".product-card");
  const relatedProductCard = target.closest(".related-product-card");
  const productCardToOpen = relatedProductCard || productCard;
  if (productCardToOpen) {
    console.log("open product id:", productCardToOpen.dataset.productId);
    push(`/product/${productCardToOpen.dataset.productId}`);
    return;
  }

  // 카테고리 필터 클릭
  const resetBtn = target.closest('[data-breadcrumb="reset"]');
  const cat1Btn = target.closest(".category1-filter-btn, [data-breadcrumb='category1']");
  const cat2Btn = target.closest(".category2-filter-btn, [data-breadcrumb='category2']");

  if (resetBtn) {
    selectedCat1 = null;
    selectedCat2 = null;

    const query = new URLSearchParams(location.search);
    query.delete("category1");
    query.delete("category2");

    // pushWithNoRender({ path: query.toString() ? `/?${query}` : "/" });
    pushWithNoRender({ path: "/" });
  } else if (cat1Btn) {
    selectedCat1 = cat1Btn.dataset.category1;
    selectedCat2 = null;

    const query = new URLSearchParams(location.search);
    query.set("category1", selectedCat1);
    query.delete("category2");

    pushWithNoRender({ path: `/?${query}`, selectedCat1, selectedCat2 });
  } else if (cat2Btn) {
    selectedCat1 = cat2Btn.dataset.category1;
    selectedCat2 = cat2Btn.dataset.category2;

    const query = new URLSearchParams(location.search);
    query.set("category1", selectedCat1);
    query.set("category2", selectedCat2);

    pushWithNoRender({ path: `/?${query}`, selectedCat1, selectedCat2 });
  }
});

document.addEventListener("change", (e) => {
  const target = e.target;

  const selectedLimit = target.closest("#limit-select")?.value;
  const selectedSort = target.closest("#sort-select")?.value;
  const query = new URLSearchParams(location.search);
  if (selectedLimit) {
    query.set("limit", selectedLimit);
    pushWithNoRender({ path: `/?${query}`, selectedCat1: null, selectedCat2: null });
  }
  if (selectedSort) {
    query.set("sort", selectedSort);
    pushWithNoRender({ path: `/?${query}`, selectedCat1: null, selectedCat2: null });
    // history.pushState(null, null, `/?${query}`);
    // refreshProducts();
  }
  // 장바구니 전체 체크박스
  const cartSelectAllCheckbox = target.closest("#cart-modal-select-all-checkbox");
  if (cartSelectAllCheckbox) {
    selectAllCartItems(cartSelectAllCheckbox.checked);
    return;
  }

  const cartItemCheckbox = target.closest(".cart-item-checkbox");
  if (cartItemCheckbox) {
    toggleCartItemSelection(cartItemCheckbox.dataset.productId, cartItemCheckbox.checked);
    return;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.closest("#search-input")) {
    e.preventDefault();
    const keyword = e.target.value.trim();
    const query = new URLSearchParams(location.search);
    if (keyword) {
      query.set("search", keyword);
      // pushWithNoRender({ path: `/?${query}`, selectedCat1: null, selectedCat2: null });
      push(`/?${query}`);
      // history.pushState(null, null, `/?${query}`);
    } else {
      query.delete("search");
      pushWithNoRender({ path: `/`, selectedCat1: null, selectedCat2: null });
      // history.pushState(null, null, `/`);
    }

    // refreshProducts();
  }
  const isCartModalOpen = () => {
    return document.getElementById("cart-modal-root")?.hasChildNodes() !== null;
  };
  if (e.key === "Escape" && isCartModalOpen()) {
    e.preventDefault();
    closeCartModal();
    return;
  }
});

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY < document.body.offsetHeight - 200) return;
  loadNextPage();
});

initRouter(render);

const main = async () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
