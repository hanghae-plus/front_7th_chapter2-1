import { Router } from "./router.js";
import { Store } from "./Store.js";
import { initialState } from "../store/initialState.js";
import { PageLayout, showToast as showToastMessage } from "../components/index.js";
import * as CartModule from "../lib/cartController.js";

const CART_METHOD_NAMES = [
  "loadCartFromStorage",
  "saveCartToStorage",
  "loadCartSelectionFromStorage",
  "saveCartSelectionToStorage",
  "ensureSelectedIdsSet",
  "areSetsEqual",
  "setSelectedIds",
  "getCartCount",
  "updateCartIcon",
  "openCartModal",
  "closeCartModal",
  "updateCartModalView",
  "normalizeCartSelections",
  "attachCartModalEventHandlers",
  "changeCartItemQuantity",
  "removeCartItem",
  "removeSelectedCartItems",
  "clearCartItems",
  "calculateCartTotals",
  "getCartItemUnitPrice",
  "getCartItemQuantity",
];

/**
 * 메인 앱 클래스
 * 전체 앱 상태 관리 및 라우팅 통합
 */
export class App {
  constructor(rootElement) {
    this.rootElement = rootElement;

    // 🏪 중앙 상태 관리 Store 생성
    this.store = new Store(initialState);

    // 개발 모드에서 상태 변경 로깅
    if (import.meta.env.DEV) {
      this.store.enableDevTools();
    }

    // IntersectionObserver 인스턴스
    this.observer = null;

    // 🔄 하위 호환성을 위한 getter/setter
    // 점진적 마이그레이션을 위해 기존 방식도 지원
    Object.defineProperty(this, "state", {
      get: () => this.store.state.catalog,
      set: (value) => {
        this.store.updateSlice("catalog", value);
      },
    });

    Object.defineProperty(this, "categoriesState", {
      get: () => this.store.state.categories,
      set: (value) => {
        this.store.updateSlice("categories", value);
      },
    });

    Object.defineProperty(this, "cartState", {
      get: () => this.store.state.cart,
      set: (value) => {
        this.store.updateSlice("cart", value);
      },
    });

    Object.defineProperty(this, "detailState", {
      get: () => this.store.state.productDetail,
      set: (value) => {
        this.store.updateSlice("productDetail", value);
      },
    });

    Object.defineProperty(this, "currentPage", {
      get: () => this.store.state.ui.currentPage,
      set: (value) => {
        this.store.updateSlice("ui", { currentPage: value });
      },
    });

    Object.defineProperty(this, "lastParams", {
      get: () => this.store.state.filters,
      set: (value) => {
        this.store.updateSlice("filters", value);
      },
    });

    // 장바구니 관련 (레거시 호환)
    Object.defineProperty(this, "cartModalElement", {
      get: () => this.store.state.cart.modalElement,
      set: (value) => {
        this.store.updateSlice("cart", { modalElement: value });
      },
    });

    Object.defineProperty(this, "cartItems", {
      get: () => this.store.state.cart.items,
      set: (value) => {
        this.store.updateSlice("cart", { items: value });
      },
    });

    this.bindCartModule();
    this.cartItems = this.loadCartFromStorage();
    const storedSelection = this.loadCartSelectionFromStorage();
    if (storedSelection instanceof Set) {
      this.store.updateSlice("cart", { selectedIds: storedSelection });
    }
    this.ensureSelectedIdsSet();
    this.normalizeCartSelections();
    this.initRouter();
  }

  bindCartModule() {
    CART_METHOD_NAMES.forEach((methodName) => {
      if (typeof CartModule[methodName] === "function") {
        this[methodName] = CartModule[methodName].bind(this);
      }
    });
  }

  initRouter() {
    this.router = new Router({
      "/product/:id": (params) => {
        this.showProductDetail(params.id);
      },
      "/": () => {
        this.showProductList();
      },
    });
  }

  navigateTo(path) {
    this.router.navigateTo(path);
  }

  async init() {
    this.router.handleRoute();
  }

  async showProductList() {
    this.currentPage = "list";
    if (this.state.products.length === 0) {
      const { CatalogPage } = await import("../pages/catalog/CatalogPage.js");
      this.catalogPage = new CatalogPage(this);
      await this.catalogPage.init();
    } else {
      if (!this.catalogPage) {
        const { CatalogPage } = await import("../pages/catalog/CatalogPage.js");
        this.catalogPage = new CatalogPage(this);
      }
      this.catalogPage.updateView();
    }
  }

  async showProductDetail(productId) {
    this.currentPage = "detail";
    this.resetObserver();

    const { ProductDetailPage } = await import("../pages/product/ProductDetailPage.js");
    this.detailPage = new ProductDetailPage(this);
    await this.detailPage.load(productId);
  }

  render(content) {
    this.rootElement.innerHTML = PageLayout({ children: content });
    this.updateCartIcon();
  }

  resetObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  showToast(message, type = "success") {
    showToastMessage(message, type);
  }
}
