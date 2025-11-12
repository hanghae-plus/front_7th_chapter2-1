import { Router } from "./router.js";
import { PageLayout, showToast as showToastMessage } from "../components/index.js";
import { DEFAULT_LIMIT, DEFAULT_SORT } from "../lib/config/catalog.js";
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
    this.lastParams = {
      limit: DEFAULT_LIMIT,
      sort: DEFAULT_SORT,
      page: 1,
      search: "",
      category1: "",
      category2: "",
    };
    this.state = {
      products: [],
      pagination: undefined,
      isLoading: false,
      isLoadingMore: false,
      loadMoreError: null,
    };
    this.observer = null;
    this.categoriesState = {
      data: [],
      isLoading: false,
      error: null,
    };
    this.cartModalElement = null;
    this.cartState = {
      selectedIds: new Set(),
      isOpen: false,
      lastFocusedElement: null,
      escListener: null,
    };
    this.currentPage = "list"; // 'list' or 'detail'
    this.detailState = {
      product: null,
      relatedProducts: [],
      isLoading: false,
      error: null,
      quantity: 1,
    };

    this.bindCartModule();
    this.cartItems = this.loadCartFromStorage();
    const storedSelection = this.loadCartSelectionFromStorage();
    if (storedSelection instanceof Set) {
      this.cartState.selectedIds = storedSelection;
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
