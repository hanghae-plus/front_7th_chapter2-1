import { Router } from "./router.js";
import { Store } from "./Store.js";
import { initialState } from "../store/initialState.js";
import { PageLayout, showToast as showToastMessage } from "../components/index.js";
import * as CartModule from "../lib/cartController.js";
import { updateURL, filtersToQueryParams, queryParamsToFilters, getCurrentQueryParams } from "../lib/utils/url.js";

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

    this.bindCartModule();
    const loadedCartItems = this.loadCartFromStorage();
    this.store.updateSlice("cart", { items: loadedCartItems });
    const storedSelection = this.loadCartSelectionFromStorage();
    if (storedSelection instanceof Set) {
      this.store.updateSlice("cart", { selectedIds: storedSelection });
    }
    this.ensureSelectedIdsSet();
    this.normalizeCartSelections();

    // URL 쿼리 파라미터를 filters 상태로 복원
    this.restoreFiltersFromURL();

    // filters 상태 변경 시 URL 자동 업데이트
    this.setupURLSync();

    this.initRouter();
  }

  /**
   * URL 쿼리 파라미터로부터 filters 상태 복원
   */
  restoreFiltersFromURL() {
    const currentPath = window.location.pathname;

    // 메인 페이지(카탈로그)에서만 URL 파라미터 복원
    if (currentPath === "/" || currentPath === "/index.html") {
      const queryParams = getCurrentQueryParams();

      // URL에 쿼리 파라미터가 있는 경우만 복원
      if (Object.keys(queryParams).length > 0) {
        const filters = queryParamsToFilters(queryParams);
        this.store.updateSlice("filters", filters);
      }
    }
  }

  /**
   * filters 상태 변경 시 URL 자동 업데이트 설정
   */
  setupURLSync() {
    this.store.subscribe((state, prevState) => {
      // filters 변경 감지
      if (JSON.stringify(state.filters) !== JSON.stringify(prevState.filters)) {
        const currentPath = window.location.pathname;

        // 메인 페이지(카탈로그)에서만 URL 업데이트
        if (currentPath === "/" || currentPath === "/index.html") {
          const queryParams = filtersToQueryParams(state.filters);
          updateURL("/", queryParams);
        }
      }
    });
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
      "*": () => {
        this.showNotFoundPage();
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
    this.store.updateSlice("ui", { currentPage: "list" });
    if (this.store.state.catalog.products.length === 0) {
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
    this.store.updateSlice("ui", { currentPage: "detail" });
    this.resetObserver();

    const { ProductDetailPage } = await import("../pages/product/ProductDetailPage.js");
    this.detailPage = new ProductDetailPage(this);
    await this.detailPage.load(productId);
  }

  async showNotFoundPage() {
    this.store.updateSlice("ui", { currentPage: "notFound" });
    this.resetObserver();

    const { NotFoundPage } = await import("../pages/NotFoundPage.js");
    const notFoundPage = new NotFoundPage(this);
    notFoundPage.render();
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
