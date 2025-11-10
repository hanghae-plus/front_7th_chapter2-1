import { PageLayout, Header, CartIconButton } from "./components/index.js";
import { getProducts, getCategories, getProduct } from "./api/productApi.js";
import { DEFAULT_LIMIT, DEFAULT_SORT } from "./shared/config/catalog.js";
import { renderLoadingContent, renderProductsContent, renderErrorContent } from "./widgets/catalog/index.js";
import { showToast as showToastMessage } from "./shared/ui/toast.js";
import * as CartModule from "./features/cart/index.js";
import { formatCurrency, escapeHtml } from "./utils/format.js";

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
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });
  }

  handleRoute() {
    const path = window.location.pathname;
    const productMatch = path.match(/^\/product\/(.+)$/);

    if (productMatch) {
      const productId = productMatch[1];
      this.showProductDetail(productId);
    } else {
      this.showProductList();
    }
  }

  navigateTo(path) {
    window.history.pushState(null, "", path);
    this.handleRoute();
  }

  async showProductList() {
    this.currentPage = "list";
    if (this.state.products.length === 0) {
      await this.init();
    } else {
      this.updateView();
    }
  }

  async showProductDetail(productId) {
    this.currentPage = "detail";
    this.resetObserver();

    this.detailState = {
      product: null,
      relatedProducts: [],
      isLoading: true,
      error: null,
      quantity: 1,
    };

    this.renderDetailLoading();

    try {
      const product = await getProduct(productId);

      if (!product || product.productId !== productId) {
        throw new Error("상품을 찾을 수 없습니다.");
      }

      // 관련 상품 로드 (같은 category2)
      let relatedProducts = [];
      if (product.category2) {
        const relatedData = await getProducts({
          category1: product.category1 || "",
          category2: product.category2 || "",
          limit: 10,
        });
        relatedProducts = relatedData.products.filter((p) => p.productId !== productId).slice(0, 4);
      }

      this.detailState = {
        product: product,
        relatedProducts,
        isLoading: false,
        error: null,
        quantity: 1,
      };

      this.renderDetailContent();
    } catch (error) {
      console.error("상품 상세 정보를 불러오는 중 오류가 발생했습니다.", error);
      this.detailState = {
        ...this.detailState,
        isLoading: false,
        error: error?.message || "상품 정보를 불러올 수 없습니다.",
      };
      this.renderDetailError();
    }
  }

  async init() {
    const path = window.location.pathname;
    const productMatch = path.match(/^\/product\/(.+)$/);

    if (productMatch) {
      const productId = productMatch[1];
      await this.showProductDetail(productId);
    } else {
      this.state = { ...this.state, isLoading: true };
      this.categoriesState = { ...this.categoriesState, isLoading: true, error: null };
      void this.loadCategories();
      await this.loadProducts({ showSkeleton: true });
    }
  }

  render(content) {
    this.rootElement.innerHTML = PageLayout({ children: content });
    this.updateCartIcon();
  }

  renderDetailLoading() {
    const detailHeaderLeft = /*html*/ `
      <div class="flex items-center space-x-3">
        <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
      </div>
    `;

    const content = /*html*/ `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="py-20 bg-gray-50 flex items-center justify-center rounded-lg">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    `;

    const cartCount = this.getCartCount();
    this.rootElement.innerHTML = PageLayout({
      header: Header({
        leftContent: detailHeaderLeft,
        rightContent: CartIconButton({ count: cartCount }),
      }),
      children: content,
    });
  }

  renderDetailError() {
    const detailHeaderLeft = /*html*/ `
      <div class="flex items-center space-x-3">
        <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
      </div>
    `;

    const content = /*html*/ `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="py-20 bg-red-50 rounded-lg">
          <div class="text-center">
            <p class="text-red-600 mb-4">${escapeHtml(this.detailState.error || "오류가 발생했습니다.")}</p>
            <button onclick="window.history.back()" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    `;

    const cartCount = this.getCartCount();
    this.rootElement.innerHTML = PageLayout({
      header: Header({
        leftContent: detailHeaderLeft,
        rightContent: CartIconButton({ count: cartCount }),
      }),
      children: content,
    });
  }

  renderDetailContent() {
    const product = this.detailState.product;
    if (!product) return;

    const quantity = this.detailState.quantity;

    const detailHeaderLeft = /*html*/ `
      <div class="flex items-center space-x-3">
        <button id="detail-back-btn" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
      </div>
    `;

    // 브레드크럼 생성
    let breadcrumb = /*html*/ `
      <a href="/" class="hover:text-blue-600 transition-colors" data-link>홈</a>
    `;

    if (product.category1) {
      breadcrumb += /*html*/ `
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <button class="breadcrumb-category1" data-category1="${escapeHtml(product.category1)}">
          ${escapeHtml(product.category1)}
        </button>
      `;
    }

    if (product.category2) {
      breadcrumb += /*html*/ `
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <button class="breadcrumb-category2" data-category1="${escapeHtml(product.category1)}" data-category2="${escapeHtml(product.category2)}">
          ${escapeHtml(product.category2)}
        </button>
      `;
    }

    // 관련 상품 HTML 생성
    const relatedProductsHtml = this.detailState.relatedProducts
      .map(
        (p) => /*html*/ `
      <div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer hover:bg-gray-100 transition-colors" data-product-id="${escapeHtml(p.productId)}">
        <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover" loading="lazy">
        </div>
        <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${escapeHtml(p.title)}</h3>
        <p class="text-sm font-bold text-blue-600">${formatCurrency(p.lprice)}원</p>
      </div>
    `,
      )
      .join("");

    const content = /*html*/ `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <!-- 브레드크럼 -->
        <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            ${breadcrumb}
          </div>
        </nav>
        
        <!-- 상품 상세 정보 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="p-4">
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="w-full h-full object-cover product-detail-image">
            </div>
            <div>
              ${product.brand ? `<p class="text-sm text-gray-600 mb-1">${escapeHtml(product.brand)}</p>` : ""}
              <h1 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(product.title)}</h1>
              <div class="mb-4">
                <span class="text-2xl font-bold text-blue-600">${formatCurrency(product.lprice)}원</span>
              </div>
              <div class="text-sm text-gray-700 leading-relaxed mb-6">
                ${escapeHtml(product.title)}에 대한 상세 설명입니다.
              </div>
            </div>
          </div>
          <div class="border-t border-gray-200 p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-900">수량</span>
              <div class="flex items-center">
                <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300 
                  rounded-l-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <input type="number" id="quantity-input" value="${quantity}" min="1" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300 
                  rounded-r-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>
            <button id="add-to-cart-btn" data-product-id="${escapeHtml(product.productId)}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md 
              hover:bg-blue-700 transition-colors font-medium">
              장바구니 담기
            </button>
          </div>
        </div>
        
        <div class="mb-6">
          <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md 
            hover:bg-gray-200 transition-colors go-to-product-list">
            상품 목록으로 돌아가기
          </button>
        </div>
        
        ${
          this.detailState.relatedProducts.length > 0
            ? /*html*/ `
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
              <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-2 gap-3">
                ${relatedProductsHtml}
              </div>
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;

    const cartCount = this.getCartCount();
    this.rootElement.innerHTML = PageLayout({
      header: Header({
        leftContent: detailHeaderLeft,
        rightContent: CartIconButton({ count: cartCount }),
      }),
      children: content,
    });
    this.attachDetailHandlers();
  }

  attachDetailHandlers() {
    const quantityDecrease = this.rootElement.querySelector("#quantity-decrease");
    const quantityIncrease = this.rootElement.querySelector("#quantity-increase");
    const quantityInput = this.rootElement.querySelector("#quantity-input");
    const addToCartBtn = this.rootElement.querySelector("#add-to-cart-btn");
    const goToListBtn = this.rootElement.querySelector(".go-to-product-list");
    const relatedProductCards = this.rootElement.querySelectorAll(".related-product-card");
    const breadcrumbCategory1 = this.rootElement.querySelector(".breadcrumb-category1");
    const breadcrumbCategory2 = this.rootElement.querySelector(".breadcrumb-category2");
    const homeLink = this.rootElement.querySelector("[data-link]");
    const cartButton = this.rootElement.querySelector("#cart-icon-btn");
    const detailBackBtn = this.rootElement.querySelector("#detail-back-btn");

    if (detailBackBtn) {
      detailBackBtn.addEventListener("click", () => {
        window.history.back();
      });
    }

    if (cartButton) {
      cartButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.openCartModal();
      });
    }

    if (homeLink) {
      homeLink.addEventListener("click", (event) => {
        event.preventDefault();
        this.navigateTo("/");
      });
    }

    if (breadcrumbCategory1) {
      breadcrumbCategory1.addEventListener("click", () => {
        const category1 = breadcrumbCategory1.dataset.category1;
        this.lastParams = {
          ...this.lastParams,
          category1: category1 || "",
          category2: "",
          page: 1,
        };
        this.navigateTo("/");
      });
    }

    if (breadcrumbCategory2) {
      breadcrumbCategory2.addEventListener("click", () => {
        const category1 = breadcrumbCategory2.dataset.category1;
        const category2 = breadcrumbCategory2.dataset.category2;
        this.lastParams = {
          ...this.lastParams,
          category1: category1 || "",
          category2: category2 || "",
          page: 1,
        };
        this.navigateTo("/");
      });
    }

    if (quantityDecrease) {
      quantityDecrease.addEventListener("click", () => {
        const currentQuantity = this.detailState.quantity;
        if (currentQuantity > 1) {
          this.detailState.quantity = currentQuantity - 1;
          if (quantityInput) quantityInput.value = String(this.detailState.quantity);
        }
      });
    }

    if (quantityIncrease) {
      quantityIncrease.addEventListener("click", () => {
        this.detailState.quantity += 1;
        if (quantityInput) quantityInput.value = String(this.detailState.quantity);
      });
    }

    if (quantityInput) {
      quantityInput.addEventListener("change", (e) => {
        const value = Number.parseInt(e.target.value, 10);
        if (!Number.isNaN(value) && value >= 1) {
          this.detailState.quantity = value;
        } else {
          this.detailState.quantity = 1;
          e.target.value = "1";
        }
      });
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        const productId = addToCartBtn.dataset.productId;
        if (productId) {
          this.handleAddToCartFromDetail(productId, this.detailState.quantity);
        }
      });
    }

    if (goToListBtn) {
      goToListBtn.addEventListener("click", () => {
        this.navigateTo("/");
      });
    }

    relatedProductCards.forEach((card) => {
      card.addEventListener("click", () => {
        const productId = card.dataset.productId;
        if (productId) {
          this.navigateTo(`/product/${productId}`);
        }
      });
    });
  }

  handleAddToCartFromDetail(productId, quantity) {
    if (!productId || !this.detailState.product) {
      return;
    }

    const product = this.detailState.product;
    const existingIndex = this.cartItems.findIndex((item) => item.productId === productId);

    if (existingIndex >= 0) {
      const existingItem = this.cartItems[existingIndex];
      const updatedItem = {
        ...existingItem,
        quantity: this.getCartItemQuantity(existingItem) + quantity,
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
        quantity: quantity,
      };
      this.cartItems = [...this.cartItems, cartItem];
    }

    this.saveCartToStorage();
    this.updateCartIcon();

    if (this.cartState.isOpen) {
      this.updateCartModalView();
    }

    this.showToast("장바구니에 추가되었습니다", "success");
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

    // 장바구니에 추가된 상품은 자동으로 선택되지 않음
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
    const productCards = this.rootElement.querySelectorAll(".product-card");

    if (cartButton) {
      cartButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.openCartModal();
      });
    }

    // 상품 카드 클릭 핸들러
    productCards.forEach((card) => {
      const productId = card.dataset.productId;
      if (!productId) return;

      // 이미지 클릭
      const imageElement = card.querySelector(".product-image");
      if (imageElement) {
        imageElement.addEventListener("click", (e) => {
          e.preventDefault();
          this.navigateTo(`/product/${productId}`);
        });
      }

      // 상품 정보 클릭
      const infoElement = card.querySelector(".product-info");
      if (infoElement) {
        infoElement.addEventListener("click", (e) => {
          e.preventDefault();
          this.navigateTo(`/product/${productId}`);
        });
      }
    });

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
