import { PageLayout } from "./components/index.js";
import { getProducts, getCategories } from "./api/productApi.js";
import { DEFAULT_LIMIT, DEFAULT_SORT } from "./shared/config/catalog.js";
import { renderLoadingContent, renderProductsContent, renderErrorContent } from "./widgets/catalog/index.js";
import { showToast as showToastMessage } from "./shared/ui/toast.js";
import * as CartModule from "./features/cart/index.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      // serviceWorker: {
      //   url: "/front_7th_chapter2-1/mockServiceWorker.js",
      // },
      onUnhandledRequest: "bypass",
    }),
  );

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

class ProductApp {
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

    this.bindCartModule();
    this.cartItems = this.loadCartFromStorage();
    const storedSelection = this.loadCartSelectionFromStorage();
    if (storedSelection instanceof Set) {
      this.cartState.selectedIds = storedSelection;
    }
    this.ensureSelectedIdsSet();
    this.normalizeCartSelections();
  }

  bindCartModule() {
    CART_METHOD_NAMES.forEach((methodName) => {
      if (typeof CartModule[methodName] === "function") {
        this[methodName] = CartModule[methodName].bind(this);
      }
    });
  }

  async init() {
    this.state = { ...this.state, isLoading: true };
    this.categoriesState = { ...this.categoriesState, isLoading: true, error: null };
    void this.loadCategories();
    await this.loadProducts({ showSkeleton: true });
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

  updateView() {
    const previousScrollY = window.scrollY;
    this.resetObserver();
    this.render(
      renderProductsContent({
        products: this.state.products,
        pagination: this.state.pagination,
        selectedLimit: this.lastParams.limit,
        selectedSort: this.lastParams.sort,
        searchValue: this.lastParams.search ?? "",
        categoryState: this.categoriesState,
        selectedCategory1: this.lastParams.category1 ?? "",
        selectedCategory2: this.lastParams.category2 ?? "",
        isLoadingMore: this.state.isLoadingMore,
        loadMoreError: this.state.loadMoreError,
      }),
    );
    window.scrollTo({ top: previousScrollY });
    this.attachMainHandlers();
    this.setupInfiniteScroll();
  }

  async loadProducts({ showSkeleton = true } = {}) {
    if (showSkeleton) {
      this.resetObserver();
      this.state = {
        ...this.state,
        isLoading: true,
        isLoadingMore: false,
        loadMoreError: null,
      };
      this.render(
        renderLoadingContent({
          selectedLimit: this.lastParams.limit,
          selectedSort: this.lastParams.sort,
          searchValue: this.lastParams.search ?? "",
          categoryState: this.categoriesState,
          selectedCategory1: this.lastParams.category1 ?? "",
          selectedCategory2: this.lastParams.category2 ?? "",
        }),
      );
      this.attachMainHandlers();
    }

    try {
      const data = await getProducts({ ...this.lastParams, page: 1 });
      this.lastParams = { ...this.lastParams, page: data.pagination?.page ?? 1 };

      this.state = {
        products: data.products,
        pagination: data.pagination,
        isLoading: false,
        isLoadingMore: false,
        loadMoreError: null,
      };

      this.updateView();
    } catch (error) {
      console.error("상품 목록을 불러오는 중 오류가 발생했습니다.", error);
      this.state = {
        ...this.state,
        isLoading: false,
        isLoadingMore: false,
        loadMoreError: error?.message ?? null,
      };
      this.resetObserver();
      this.render(renderErrorContent(error?.message));
      this.attachRetryHandler();
    }
  }

  async loadCategories() {
    try {
      const rawCategories = await getCategories();
      const parsedCategories = Object.entries(rawCategories ?? {}).map(([name, children]) => ({
        name,
        children: Object.keys(children ?? {}).sort(),
      }));

      this.categoriesState = {
        data: parsedCategories,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error("카테고리를 불러오는 중 오류가 발생했습니다.", error);
      this.categoriesState = {
        data: [],
        isLoading: false,
        error: error?.message ?? "카테고리를 불러오지 못했습니다.",
      };
    } finally {
      if (this.state.isLoading) {
        this.render(
          renderLoadingContent({
            selectedLimit: this.lastParams.limit,
            selectedSort: this.lastParams.sort,
            searchValue: this.lastParams.search ?? "",
            categoryState: this.categoriesState,
            selectedCategory1: this.lastParams.category1 ?? "",
            selectedCategory2: this.lastParams.category2 ?? "",
          }),
        );
        this.attachMainHandlers();
      } else {
        this.updateView();
      }
    }
  }

  async loadMoreProducts() {
    if (this.state.isLoadingMore) {
      return;
    }

    const pagination = this.state.pagination;
    if (!pagination?.hasNext) {
      return;
    }

    const nextPage = (pagination.page ?? 1) + 1;

    this.state = {
      ...this.state,
      isLoadingMore: true,
      loadMoreError: null,
    };
    this.updateView();

    try {
      const data = await getProducts({ ...this.lastParams, page: nextPage });
      this.lastParams = { ...this.lastParams, page: data.pagination?.page ?? nextPage };
      this.state = {
        ...this.state,
        products: [...this.state.products, ...data.products],
        pagination: data.pagination,
        isLoadingMore: false,
        loadMoreError: null,
      };
      this.updateView();
    } catch (error) {
      console.error("다음 상품을 불러오는 중 오류가 발생했습니다.", error);
      this.state = {
        ...this.state,
        isLoadingMore: false,
        loadMoreError: error?.message ?? "잠시 후 다시 시도해주세요.",
      };
      this.updateView();
    }
  }

  handleAddToCart(productId) {
    if (!productId) {
      return;
    }

    const product = this.state.products.find((item) => item.productId === productId);
    if (!product) {
      return;
    }

    const existingIndex = this.cartItems.findIndex((item) => item.productId === productId);

    if (existingIndex >= 0) {
      const existingItem = this.cartItems[existingIndex];
      const updatedItem = {
        ...existingItem,
        quantity: this.getCartItemQuantity(existingItem) + 1,
      };
      this.cartItems = [
        ...this.cartItems.slice(0, existingIndex),
        updatedItem,
        ...this.cartItems.slice(existingIndex + 1),
      ];
    } else {
      const cartItem = {
        productId,
        title: product.title ?? "",
        price: product.lprice ?? "",
        image: product.image ?? "",
        brand: product.brand ?? "",
        quantity: 1,
      };
      this.cartItems = [...this.cartItems, cartItem];
    }

    const nextSelected = new Set(this.ensureSelectedIdsSet());
    nextSelected.add(productId);
    this.setSelectedIds(nextSelected);

    this.saveCartToStorage();
    this.updateCartIcon();

    if (this.cartState.isOpen) {
      this.updateCartModalView();
    }

    this.showToast("장바구니에 추가되었습니다", "success");
  }

  handleSearch(value) {
    const nextSearch = value.trim();
    if (nextSearch === (this.lastParams.search ?? "")) {
      return;
    }

    this.lastParams = {
      ...this.lastParams,
      search: nextSearch,
      page: 1,
    };

    void this.loadProducts({ showSkeleton: true });
  }

  handleCategorySelect({ category1 = "", category2 = "" } = {}) {
    const nextCategory1 = category1;
    const nextCategory2 = nextCategory1 ? category2 : "";

    const currentCategory1 = this.lastParams.category1 ?? "";
    const currentCategory2 = this.lastParams.category2 ?? "";

    if (nextCategory1 === currentCategory1 && nextCategory2 === currentCategory2) {
      return;
    }

    this.lastParams = {
      ...this.lastParams,
      category1: nextCategory1,
      category2: nextCategory2,
      page: 1,
    };

    void this.loadProducts({ showSkeleton: true });
  }

  attachMainHandlers() {
    const searchInput = this.rootElement.querySelector("#search-input");
    const limitSelect = this.rootElement.querySelector("#limit-select");
    const sortSelect = this.rootElement.querySelector("#sort-select");
    const loadMoreRetryButton = this.rootElement.querySelector("#load-more-retry-button");
    const category1Buttons = this.rootElement.querySelectorAll(".category1-filter-btn");
    const category2Buttons = this.rootElement.querySelectorAll(".category2-filter-btn");
    const breadcrumbButtons = this.rootElement.querySelectorAll("[data-breadcrumb]");
    const addToCartButtons = this.rootElement.querySelectorAll(".add-to-cart-btn");
    const cartButton = this.rootElement.querySelector("#cart-icon-btn");

    if (cartButton) {
      cartButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.openCartModal();
      });
    }

    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = this.lastParams.search ?? "";
      searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();
        const target = event.target;
        if (target instanceof HTMLInputElement) {
          this.handleSearch(target.value);
        }
      });
    }

    if (limitSelect) {
      limitSelect.value = String(this.lastParams.limit);
      limitSelect.addEventListener("change", (event) => {
        const select = event.target;
        if (!(select instanceof HTMLSelectElement)) {
          return;
        }

        const nextLimit = Number.parseInt(select.value, 10);
        if (Number.isNaN(nextLimit) || nextLimit === this.lastParams.limit) {
          return;
        }

        this.lastParams = { ...this.lastParams, limit: nextLimit, page: 1 };
        void this.loadProducts({ showSkeleton: true });
      });
    }

    if (sortSelect) {
      sortSelect.value = this.lastParams.sort;
      sortSelect.addEventListener("change", (event) => {
        const select = event.target;
        if (!(select instanceof HTMLSelectElement)) {
          return;
        }

        const nextSort = select.value;
        if (nextSort === this.lastParams.sort) {
          return;
        }

        this.lastParams = { ...this.lastParams, sort: nextSort, page: 1 };
        void this.loadProducts({ showSkeleton: true });
      });
    }

    if (loadMoreRetryButton) {
      loadMoreRetryButton.addEventListener("click", () => {
        void this.loadMoreProducts();
      });
    }

    category1Buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const category1 = button.dataset.category1 ?? "";
        if (!category1) {
          return;
        }
        this.handleCategorySelect({ category1, category2: "" });
      });
    });

    category2Buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const category1 = button.dataset.category1 ?? "";
        const category2 = button.dataset.category2 ?? "";
        if (!category1 || !category2) {
          return;
        }
        this.handleCategorySelect({ category1, category2 });
      });
    });

    breadcrumbButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const type = button.dataset.breadcrumb;
        if (!type) {
          return;
        }

        if (type === "reset") {
          this.handleCategorySelect({ category1: "", category2: "" });
        } else if (type === "category1") {
          const category1 = button.dataset.category1 ?? "";
          this.handleCategorySelect({ category1, category2: "" });
        } else if (type === "category2") {
          const category1 = button.dataset.category1 ?? "";
          const category2 = button.dataset.category2 ?? "";
          this.handleCategorySelect({ category1, category2 });
        }
      });
    });

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const productId = button.dataset.productId;
        if (productId) {
          this.handleAddToCart(productId);
        }
      });
    });
  }

  attachRetryHandler() {
    const retryButton = this.rootElement.querySelector("#retry-button");
    if (!retryButton) {
      return;
    }

    retryButton.addEventListener("click", () => {
      void this.loadProducts({ showSkeleton: true });
    });
  }

  setupInfiniteScroll() {
    if (this.state.loadMoreError) {
      return;
    }

    const pagination = this.state.pagination;
    if (!pagination?.hasNext) {
      return;
    }

    const sentinel = this.rootElement.querySelector("#load-more-sentinel");
    if (!sentinel) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.state.isLoadingMore || this.state.loadMoreError) {
          return;
        }

        if (entries.some((entry) => entry.isIntersecting)) {
          void this.loadMoreProducts();
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 },
    );

    this.observer.observe(sentinel);
  }

  showToast(message, type = "success") {
    showToastMessage(message, type);
  }
}

function main() {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("root element not found");
  }

  const app = new ProductApp(root);
  app.init();
}

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
