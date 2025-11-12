import { HomePage } from "./pages/HomePage.js";
import { getProducts, getProduct, getCategories } from "./api/productApi.js";
import { DetailPage } from "./pages/Detailpage.js";
import { bindSearchFormEvents } from "./components/SearchForm.js";
import { openCartModal } from "./app/cart/modal.js";
import { showToast } from "./app/toast/toast.js";

const basePath = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

const enableMocking = () =>
  import("@/mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

function getNormalizedPathname() {
  const path = location.pathname;

  if (basePath && path.startsWith(basePath)) {
    const normalized = path.slice(basePath.length);
    if (!normalized) {
      return "/";
    }
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }

  return path || "/";
}

let currentLimit = 20;
let currentSort = "price_asc";
let currentSearch = "";
let currentCategory1 = "";
let currentCategory2 = "";
let currentProducts = [];
let currentProductDetail = null;
let cartBadgeUnsubscribe = null;

const STORAGE_KEY = "spa_cart_items";
const cartListeners = new Set();
let cartItems = loadCartFromStorage();
let categoriesCache = null;
let categoriesInFlight = null;

async function loadCategories() {
  if (categoriesCache) {
    return categoriesCache;
  }

  if (!categoriesInFlight) {
    categoriesInFlight = getCategories()
      .then((data) => {
        categoriesCache = data ?? {};
        return categoriesCache;
      })
      .finally(() => {
        categoriesInFlight = null;
      });
  }

  return categoriesInFlight;
}

function bindFilters() {
  bindSearchFormEvents({
    currentLimit,
    currentSort,
    currentSearch,
    onLimitChange: (nextLimit) => {
      if (currentLimit === nextLimit) {
        return;
      }
      currentLimit = nextLimit;
      render();
    },
    onSortChange: (nextSort) => {
      if (currentSort === nextSort) {
        return;
      }
      currentSort = nextSort;
      render();
    },
    onSearchSubmit: (nextSearch) => {
      if (currentSearch === nextSearch) {
        return;
      }
      currentSearch = nextSearch;
      render();
    },
    onCategoryReset: () => {
      if (!currentCategory1 && !currentCategory2) {
        return;
      }
      currentCategory1 = "";
      currentCategory2 = "";
      render();
    },
    onCategory1Change: (nextCategory1) => {
      if (currentCategory1 === nextCategory1 && !currentCategory2) {
        return;
      }
      currentCategory1 = nextCategory1;
      currentCategory2 = "";
      render();
    },
    onCategory2Change: (nextCategory1, nextCategory2) => {
      if (currentCategory1 === nextCategory1 && currentCategory2 === nextCategory2) {
        return;
      }
      currentCategory1 = nextCategory1;
      currentCategory2 = nextCategory2;
      render();
    },
  });
}

async function render() {
  const $root = document.getElementById("root");
  const pathname = getNormalizedPathname();

  if (pathname === "/" || pathname === "") {
    currentProductDetail = null;
    $root.innerHTML = HomePage({
      loading: true,
      filters: {
        limit: currentLimit,
        sort: currentSort,
        search: currentSearch,
        category1: currentCategory1,
        category2: currentCategory2,
      },
    });

    const categoriesPromise = loadCategories().catch((error) => {
      console.error("카테고리 로딩 실패:", error);
      return {};
    });

    try {
      const data = await getProducts({
        limit: currentLimit,
        sort: currentSort,
        search: currentSearch,
        category1: currentCategory1,
        category2: currentCategory2,
      });
      currentProducts = data?.products ?? [];
      const categories = await categoriesPromise;
      const filters = {
        ...(data?.filters ?? {}),
        limit: currentLimit,
        sort: currentSort,
        search: currentSearch,
        category1: currentCategory1,
        category2: currentCategory2,
      };

      $root.innerHTML = HomePage({ ...data, filters, categories, loading: false });
      bindFilters();
      bindCartIcon();
    } catch (error) {
      console.error("상품 목록 로딩 실패:", error);
      currentProducts = [];
      const categories = await categoriesPromise;
      $root.innerHTML = HomePage({
        loading: false,
        products: [],
        filters: {
          limit: currentLimit,
          sort: currentSort,
          search: currentSearch,
          category1: currentCategory1,
          category2: currentCategory2,
        },
        pagination: {},
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        categories,
      });
      bindFilters();
      bindCartIcon();
    }
  } else if (pathname.startsWith("/product/")) {
    currentProducts = [];
    $root.innerHTML = DetailPage({ loading: true });
    const productId = pathname.split("/").pop();
    const data = await getProduct(productId);
    currentProductDetail = data;
    $root.innerHTML = DetailPage({ product: data, loading: false });
    bindCartIcon();
  } else {
    // fallback: 홈으로 이동
    history.replaceState({}, "", `${basePath}/`);
    render();
    return;
  }
}

document.addEventListener("click", (event) => {
  const addToCartButton = event.target.closest(".add-to-cart-btn");
  if (addToCartButton) {
    event.preventDefault();
    event.stopPropagation();
    const productId = addToCartButton.dataset.productId;
    if (productId) {
      addProductToCart(productId);
    }
    return;
  }

  const productCard = event.target.closest(".product-card");

  if (!productCard) {
    return;
  }

  const productId = productCard.dataset.productId;

  if (!productId) {
    return;
  }

  const nextUrl = `${basePath}/product/${productId}`;
  history.pushState({}, "", nextUrl);
  render();
});

window.addEventListener("popstate", () => {
  render();
});

function main() {
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}

function getCartProduct(productId) {
  if (!productId) {
    return null;
  }

  const listMatch = currentProducts.find((item) => item.productId === productId);
  if (listMatch) {
    return listMatch;
  }

  if (currentProductDetail?.productId === productId) {
    return currentProductDetail;
  }

  return null;
}

function addProductToCart(productId) {
  const product = getCartProduct(productId);
  if (!product) {
    console.warn("상품 정보를 찾을 수 없어 장바구니에 담지 못했습니다.", productId);
    return;
  }
  const existing = cartItems.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
    existing.selected = true;
  } else {
    cartItems.push({
      productId,
      title: product.title,
      price: Number(product.lprice ?? product.price ?? 0),
      image: product.image,
      brand: product.brand ?? "",
      selected: true,
      quantity: 1,
    });
  }
  persistCart();
  notifyCartListeners();
  showToast("장바구니에 상품이 담겼습니다.");
}

function bindCartIcon() {
  const cartButton = document.getElementById("cart-icon-btn");
  if (!cartButton || cartButton.dataset.bound === "true") return;
  cartButton.dataset.bound = "true";
  cartButton.addEventListener("click", (event) => {
    event.preventDefault();
    openCartModal();
  });
  if (cartBadgeUnsubscribe) {
    cartBadgeUnsubscribe();
  }
  cartBadgeUnsubscribe = subscribeCart((snapshot) => updateCartBadge(cartButton, snapshot));
}

function updateCartBadge(button, snapshot) {
  if (!button) return;
  let badge = button.querySelector("[data-cart-count]");
  const count = snapshot.summary.totalCount;
  if (!count) {
    if (badge) badge.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement("span");
    badge.dataset.cartCount = "true";
    badge.className =
      "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
    button.appendChild(badge);
  }
  badge.textContent = String(count);
}

function getCartSnapshot() {
  const totalCount = cartItems.length;
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedItems = cartItems.filter((item) => item.selected);
  const selectedCount = selectedItems.length;
  const selectedPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    items: cartItems.map((item) => ({
      ...item,
      priceLabel: `${item.price.toLocaleString()}원`,
      totalLabel: `${(item.price * item.quantity).toLocaleString()}원`,
    })),
    summary: {
      totalCount,
      totalPrice,
      totalPriceLabel: `${totalPrice.toLocaleString()}원`,
      selectedCount,
      selectedPrice,
      selectedPriceLabel: `${selectedPrice.toLocaleString()}원`,
    },
    isEmpty: totalCount === 0,
    allSelected: totalCount > 0 && selectedCount === totalCount,
  };
}

function notifyCartListeners() {
  const snapshot = getCartSnapshot();
  cartListeners.forEach((listener) => listener(snapshot));
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: snapshot }));
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      productId: item.productId,
      title: item.title ?? "",
      image: item.image ?? "",
      brand: item.brand ?? "",
      price: Number(item.price ?? 0),
      quantity: Math.max(1, Number(item.quantity ?? 1)),
      selected: item.selected !== false,
    }));
  } catch (error) {
    console.warn("장바구니 데이터를 불러오지 못했습니다.", error);
    return [];
  }
}

function persistCart() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        cartItems.map((item) => ({
          productId: item.productId,
          title: item.title,
          image: item.image,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity,
          selected: item.selected,
        })),
      ),
    );
  } catch (error) {
    console.warn("장바구니 데이터를 저장하지 못했습니다.", error);
  }
}

function toggleCartItem(productId) {
  const target = cartItems.find((item) => item.productId === productId);
  if (!target) return;
  target.selected = !target.selected;
  persistCart();
  notifyCartListeners();
}

function toggleCartAll(checked) {
  cartItems.forEach((item) => {
    item.selected = checked;
  });
  persistCart();
  notifyCartListeners();
}

function updateCartQuantity(productId, nextQuantity) {
  const quantity = Math.max(1, Number(nextQuantity ?? 1));
  const target = cartItems.find((item) => item.productId === productId);
  if (!target) return;
  target.quantity = quantity;
  persistCart();
  notifyCartListeners();
}

function removeCartItem(productId) {
  const beforeLength = cartItems.length;
  cartItems = cartItems.filter((item) => item.productId !== productId);
  if (cartItems.length === beforeLength) return;
  persistCart();
  notifyCartListeners();
}

function clearCart() {
  if (cartItems.length === 0) return;
  cartItems = [];
  persistCart();
  notifyCartListeners();
}

function removeSelectedCartItems() {
  const beforeLength = cartItems.length;
  cartItems = cartItems.filter((item) => !item.selected);
  if (cartItems.length === beforeLength) return;
  persistCart();
  notifyCartListeners();
}

function subscribeCart(listener) {
  if (typeof listener !== "function") return () => {};
  cartListeners.add(listener);
  listener(getCartSnapshot());
  return () => {
    cartListeners.delete(listener);
  };
}

window.cartManager = {
  getState: getCartSnapshot,
  subscribe: subscribeCart,
  addItem: addProductToCart,
  toggleItem: toggleCartItem,
  toggleAll: toggleCartAll,
  updateQuantity: updateCartQuantity,
  removeItem: removeCartItem,
  removeSelected: removeSelectedCartItems,
  clear: clearCart,
};

notifyCartListeners();
