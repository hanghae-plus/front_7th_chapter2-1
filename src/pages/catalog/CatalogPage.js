import { getProducts, getCategories } from "../../lib/api/productApi.js";
import { renderLoadingContent, renderProductsContent, renderErrorContent } from "../../components/index.js";

/**
 * 상품 목록 페이지 컨트롤러
 */
export class CatalogPage {
  constructor(app) {
    this.app = app;
  }

  async init() {
    this.app.state = { ...this.app.state, isLoading: true };
    this.app.categoriesState = { ...this.app.categoriesState, isLoading: true, error: null };
    void this.loadCategories();
    await this.loadProducts({ showSkeleton: true });
  }

  updateView() {
    const previousScrollY = window.scrollY;
    this.app.resetObserver();
    this.app.render(
      renderProductsContent({
        products: this.app.state.products,
        pagination: this.app.state.pagination,
        selectedLimit: this.app.lastParams.limit,
        selectedSort: this.app.lastParams.sort,
        searchValue: this.app.lastParams.search ?? "",
        categoryState: this.app.categoriesState,
        selectedCategory1: this.app.lastParams.category1 ?? "",
        selectedCategory2: this.app.lastParams.category2 ?? "",
        isLoadingMore: this.app.state.isLoadingMore,
        loadMoreError: this.app.state.loadMoreError,
      }),
    );
    window.scrollTo({ top: previousScrollY });
    this.attachMainHandlers();
    this.setupInfiniteScroll();
  }

  async loadProducts({ showSkeleton = true } = {}) {
    if (showSkeleton) {
      this.app.resetObserver();
      this.app.state = {
        ...this.app.state,
        isLoading: true,
        isLoadingMore: false,
        loadMoreError: null,
      };
      this.app.render(
        renderLoadingContent({
          selectedLimit: this.app.lastParams.limit,
          selectedSort: this.app.lastParams.sort,
          searchValue: this.app.lastParams.search ?? "",
          categoryState: this.app.categoriesState,
          selectedCategory1: this.app.lastParams.category1 ?? "",
          selectedCategory2: this.app.lastParams.category2 ?? "",
        }),
      );
      this.attachMainHandlers();
    }

    try {
      const data = await getProducts({ ...this.app.lastParams, page: 1 });
      this.app.lastParams = { ...this.app.lastParams, page: data.pagination?.page ?? 1 };

      this.app.state = {
        products: data.products,
        pagination: data.pagination,
        isLoading: false,
        isLoadingMore: false,
        loadMoreError: null,
      };

      this.updateView();
    } catch (error) {
      console.error("상품 목록을 불러오는 중 오류가 발생했습니다.", error);
      this.app.state = {
        ...this.app.state,
        isLoading: false,
        isLoadingMore: false,
        loadMoreError: error?.message ?? null,
      };
      this.app.resetObserver();
      this.app.render(renderErrorContent(error?.message));
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

      this.app.categoriesState = {
        data: parsedCategories,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.error("카테고리를 불러오는 중 오류가 발생했습니다.", error);
      this.app.categoriesState = {
        data: [],
        isLoading: false,
        error: error?.message ?? "카테고리를 불러오지 못했습니다.",
      };
    } finally {
      if (this.app.state.isLoading) {
        this.app.render(
          renderLoadingContent({
            selectedLimit: this.app.lastParams.limit,
            selectedSort: this.app.lastParams.sort,
            searchValue: this.app.lastParams.search ?? "",
            categoryState: this.app.categoriesState,
            selectedCategory1: this.app.lastParams.category1 ?? "",
            selectedCategory2: this.app.lastParams.category2 ?? "",
          }),
        );
        this.attachMainHandlers();
      } else {
        this.updateView();
      }
    }
  }

  async loadMoreProducts() {
    if (this.app.state.isLoadingMore) {
      return;
    }

    const pagination = this.app.state.pagination;
    if (!pagination?.hasNext) {
      return;
    }

    const nextPage = (pagination.page ?? 1) + 1;

    this.app.state = {
      ...this.app.state,
      isLoadingMore: true,
      loadMoreError: null,
    };
    this.updateView();

    try {
      const data = await getProducts({ ...this.app.lastParams, page: nextPage });
      this.app.lastParams = { ...this.app.lastParams, page: data.pagination?.page ?? nextPage };
      this.app.state = {
        ...this.app.state,
        products: [...this.app.state.products, ...data.products],
        pagination: data.pagination,
        isLoadingMore: false,
        loadMoreError: null,
      };
      this.updateView();
    } catch (error) {
      console.error("다음 상품을 불러오는 중 오류가 발생했습니다.", error);
      this.app.state = {
        ...this.app.state,
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

    const product = this.app.state.products.find((item) => item.productId === productId);
    if (!product) {
      return;
    }

    const existingIndex = this.app.cartItems.findIndex((item) => item.productId === productId);

    if (existingIndex >= 0) {
      const existingItem = this.app.cartItems[existingIndex];
      const updatedItem = {
        ...existingItem,
        quantity: this.app.getCartItemQuantity(existingItem) + 1,
      };
      this.app.cartItems = [
        ...this.app.cartItems.slice(0, existingIndex),
        updatedItem,
        ...this.app.cartItems.slice(existingIndex + 1),
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
      this.app.cartItems = [...this.app.cartItems, cartItem];
    }

    this.app.saveCartToStorage();
    this.app.updateCartIcon();

    if (this.app.cartState.isOpen) {
      this.app.updateCartModalView();
    }

    this.app.showToast("장바구니에 추가되었습니다", "success");
  }

  handleSearch(value) {
    const nextSearch = value.trim();
    if (nextSearch === (this.app.lastParams.search ?? "")) {
      return;
    }

    this.app.lastParams = {
      ...this.app.lastParams,
      search: nextSearch,
      page: 1,
    };

    void this.loadProducts({ showSkeleton: true });
  }

  handleCategorySelect({ category1 = "", category2 = "" } = {}) {
    const nextCategory1 = category1;
    const nextCategory2 = nextCategory1 ? category2 : "";

    const currentCategory1 = this.app.lastParams.category1 ?? "";
    const currentCategory2 = this.app.lastParams.category2 ?? "";

    if (nextCategory1 === currentCategory1 && nextCategory2 === currentCategory2) {
      return;
    }

    this.app.lastParams = {
      ...this.app.lastParams,
      category1: nextCategory1,
      category2: nextCategory2,
      page: 1,
    };

    void this.loadProducts({ showSkeleton: true });
  }

  attachMainHandlers() {
    const searchInput = this.app.rootElement.querySelector("#search-input");
    const limitSelect = this.app.rootElement.querySelector("#limit-select");
    const sortSelect = this.app.rootElement.querySelector("#sort-select");
    const loadMoreRetryButton = this.app.rootElement.querySelector("#load-more-retry-button");
    const category1Buttons = this.app.rootElement.querySelectorAll(".category1-filter-btn");
    const category2Buttons = this.app.rootElement.querySelectorAll(".category2-filter-btn");
    const breadcrumbButtons = this.app.rootElement.querySelectorAll("[data-breadcrumb]");
    const addToCartButtons = this.app.rootElement.querySelectorAll(".add-to-cart-btn");
    const cartButton = this.app.rootElement.querySelector("#cart-icon-btn");
    const productCards = this.app.rootElement.querySelectorAll(".product-card");

    if (cartButton) {
      cartButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.app.openCartModal();
      });
    }

    productCards.forEach((card) => {
      const productId = card.dataset.productId;
      if (!productId) return;

      const imageElement = card.querySelector(".product-image");
      if (imageElement) {
        imageElement.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.navigateTo(`/product/${productId}`);
        });
      }

      const infoElement = card.querySelector(".product-info");
      if (infoElement) {
        infoElement.addEventListener("click", (e) => {
          e.preventDefault();
          this.app.navigateTo(`/product/${productId}`);
        });
      }
    });

    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = this.app.lastParams.search ?? "";
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
      limitSelect.value = String(this.app.lastParams.limit);
      limitSelect.addEventListener("change", (event) => {
        const select = event.target;
        if (!(select instanceof HTMLSelectElement)) {
          return;
        }

        const nextLimit = Number.parseInt(select.value, 10);
        if (Number.isNaN(nextLimit) || nextLimit === this.app.lastParams.limit) {
          return;
        }

        this.app.lastParams = { ...this.app.lastParams, limit: nextLimit, page: 1 };
        void this.loadProducts({ showSkeleton: true });
      });
    }

    if (sortSelect) {
      sortSelect.value = this.app.lastParams.sort;
      sortSelect.addEventListener("change", (event) => {
        const select = event.target;
        if (!(select instanceof HTMLSelectElement)) {
          return;
        }

        const nextSort = select.value;
        if (nextSort === this.app.lastParams.sort) {
          return;
        }

        this.app.lastParams = { ...this.app.lastParams, sort: nextSort, page: 1 };
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
    const retryButton = this.app.rootElement.querySelector("#retry-button");
    if (!retryButton) {
      return;
    }

    retryButton.addEventListener("click", () => {
      void this.loadProducts({ showSkeleton: true });
    });
  }

  setupInfiniteScroll() {
    if (this.app.state.loadMoreError) {
      return;
    }

    const pagination = this.app.state.pagination;
    if (!pagination?.hasNext) {
      return;
    }

    const sentinel = this.app.rootElement.querySelector("#load-more-sentinel");
    if (!sentinel) {
      return;
    }

    this.app.observer = new IntersectionObserver(
      (entries) => {
        if (this.app.state.isLoadingMore || this.app.state.loadMoreError) {
          return;
        }

        if (entries.some((entry) => entry.isIntersecting)) {
          void this.loadMoreProducts();
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 },
    );

    this.app.observer.observe(sentinel);
  }
}
