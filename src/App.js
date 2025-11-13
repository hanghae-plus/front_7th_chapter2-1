import { createRouter, setupLinkHandler } from "./core/router.js";
import { createInfiniteScroll } from "./core/infiniteScroll.js";
import { createLifecycleComponent } from "./utils/createLifecycleComponent.js";
import { getCategories, getProducts, getProduct } from "./api/productApi.js";
import { getQueryParams } from "./utils/queryParams.js";
import appStore, { appActions, eventBus } from "./store/appStore.js";
import HomePage from "./pages/HomePage.js";
import DetailPage from "./pages/DetailPage.js";
import NotFoundPage from "./pages/NotFoundPage.js";
import ProductList from "./components/product/ProductList.js";
import CartModal from "./components/CartModal.js";
import { showToast } from "./utils/toast.js";

// 앱 상태
const appState = {
  categories: {},
  router: null,
  infiniteScroll: null,
  currentPageComponent: null,
  currentRequestId: 0,
};

// 헬퍼 함수
const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      searchParams.set(key, value);
    }
  });
  return searchParams.toString();
};

const updateQueryParam = (updates) => {
  const params = getQueryParams();
  Object.assign(params, updates);
  appState.router.push(`/?${buildQueryString(params)}`);
};

// 전역 이벤트 위임
const setupGlobalEventDelegation = () => {
  // 클릭 이벤트 위임
  document.addEventListener("click", (e) => {
    const handlers = [
      {
        selector: ".category1-filter-btn",
        handler: (target) =>
          updateQueryParam({
            category1: target.dataset.category1,
            category2: "",
          }),
      },
      {
        selector: ".category2-filter-btn",
        handler: (target) => updateQueryParam({ category2: target.dataset.category2 }),
      },
      {
        selector: '[data-breadcrumb="all"]',
        handler: () => updateQueryParam({ category1: "", category2: "" }),
      },
      {
        selector: '[data-breadcrumb="category1"]',
        handler: (target) =>
          updateQueryParam({
            category1: target.dataset.value,
            category2: "",
          }),
      },
      // 장바구니 담기 버튼 (상품 카드용) - product-card보다 먼저 처리
      {
        selector: ".add-to-cart-btn",
        handler: async (target, e) => {
          e.stopPropagation(); // 이벤트 전파 중지 (상품 카드 클릭 방지)
          const productId = target.dataset.productId;
          await handleAddToCartFromCard(productId);
        },
      },
      // 상세페이지 관련
      {
        selector: ".product-card",
        handler: (target) => {
          const productId = target.dataset.productId;
          if (productId) {
            appState.router.push(`/product/${productId}`);
          }
        },
      },
      {
        selector: ".related-product-card",
        handler: (target) => {
          const productId = target.dataset.productId;
          if (productId) {
            appState.router.push(`/product/${productId}`);
          }
        },
      },
      {
        selector: ".go-to-product-list",
        handler: () => {
          appState.router.push("/");
        },
      },
      {
        selector: ".breadcrumb-link",
        handler: (target) => {
          const category1 = target.dataset.category1;
          const category2 = target.dataset.category2;
          if (category2) {
            appState.router.push(`/?category1=${category1}&category2=${category2}`);
          } else if (category1) {
            appState.router.push(`/?category1=${category1}`);
          }
        },
      },
      {
        selector: "#quantity-decrease",
        handler: () => handleQuantityDecrease(),
      },
      {
        selector: "#quantity-increase",
        handler: () => handleQuantityIncrease(),
      },
      {
        selector: "#add-to-cart-btn",
        handler: (target) => handleAddToCart(target),
      },
      // 장바구니 관련
      {
        selector: "#cart-icon-btn",
        handler: () => appActions.openCartModal(),
      },
      {
        selector: "#cart-modal-close-btn",
        handler: () => appActions.closeCartModal(),
      },
      {
        selector: "#cart-modal-select-all-checkbox",
        handler: (target) => {
          if (target.checked) {
            appActions.selectAllCart();
          } else {
            appActions.deselectAllCart();
          }
        },
      },
      {
        selector: ".cart-item-checkbox",
        handler: (target) => appActions.toggleCartSelection(target.dataset.productId),
      },
      {
        selector: ".cart-item-image",
        handler: (target) => {
          appActions.closeCartModal();
          appState.router.push(`/product/${target.dataset.productId}`);
        },
      },
      {
        selector: ".cart-item-title",
        handler: (target) => {
          appActions.closeCartModal();
          appState.router.push(`/product/${target.dataset.productId}`);
        },
      },
      {
        selector: ".quantity-decrease-btn",
        handler: (target) => {
          const productId = target.dataset.productId;
          const state = appStore.getState();
          const item = state.cart.find((i) => i.productId === productId);
          if (item && item.quantity > 1) {
            appActions.updateCartQuantity(productId, item.quantity - 1);
          }
        },
      },
      {
        selector: ".quantity-increase-btn",
        handler: (target) => {
          const productId = target.dataset.productId;
          const state = appStore.getState();
          const item = state.cart.find((i) => i.productId === productId);
          if (item) {
            appActions.updateCartQuantity(productId, item.quantity + 1);
          }
        },
      },
      {
        selector: ".cart-item-remove-btn",
        handler: (target) => appActions.removeCartItem(target.dataset.productId),
      },
      {
        selector: "#cart-modal-remove-selected-btn",
        handler: () => appActions.removeSelectedCartItems(),
      },
      {
        selector: "#cart-modal-clear-cart-btn",
        handler: () => {
          appActions.clearCart();
        },
      },
      {
        selector: "#cart-modal-checkout-btn",
        handler: () => {
          alert("구매하기 기능은 준비 중입니다!");
        },
      },
    ];

    for (const { selector, handler } of handlers) {
      const target = e.target.closest(selector);
      if (target) {
        handler(target, e);
        return;
      }
    }
  });

  // change 이벤트 위임
  document.addEventListener("change", (e) => {
    const changeHandlers = {
      "limit-select": (value) => updateQueryParam({ limit: value }),
      "sort-select": (value) => updateQueryParam({ sort: value }),
    };

    const handler = changeHandlers[e.target.id];
    if (handler) {
      handler(e.target.value);
    }
  });

  // keypress 이벤트 위임
  document.addEventListener("keypress", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      const searchValue = e.target.value.trim();
      updateQueryParam({ search: searchValue });
    }
  });

  // keydown 이벤트 위임
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const state = appStore.getState();
      if (state.cartModalOpen) {
        appActions.closeCartModal();
      }
    }
  });
};

// 상세페이지 핸들러
const handleQuantityDecrease = () => {
  const input = document.querySelector("#quantity-input");
  if (input) {
    const currentValue = parseInt(input.value, 10);
    if (currentValue > parseInt(input.min, 10)) {
      input.value = currentValue - 1;
    }
  }
};

const handleQuantityIncrease = () => {
  const input = document.querySelector("#quantity-input");
  if (input) {
    const currentValue = parseInt(input.value, 10);
    const maxValue = parseInt(input.max, 10);
    if (currentValue < maxValue) {
      input.value = currentValue + 1;
    }
  }
};

const handleAddToCart = async (target) => {
  const productId = target.dataset.productId;
  const quantityInput = document.querySelector("#quantity-input");
  const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

  console.log(`장바구니에 상품 추가: ${productId}, 수량: ${quantity}`);

  try {
    // 상품 정보 가져오기 (상세 페이지에서는 이미 있을 수 있음)
    const state = appStore.getState();
    let product = state.detailProduct?.productId === productId ? state.detailProduct : null;

    // 상품 정보가 없으면 API에서 가져오기
    if (!product) {
      product = await getProduct(productId);
    }

    if (product) {
      appActions.addToCart(product, quantity);
      console.log("장바구니에 추가되었습니다!");
    }
  } catch (error) {
    console.error("장바구니 추가 실패:", error);
  }
};

// 상품 카드에서 장바구니 추가 (수량 1개 고정)
const handleAddToCartFromCard = async (productId) => {
  try {
    // 상품 목록에서 해당 상품 찾기
    const state = appStore.getState();
    let product = state.products.find((p) => p.productId === productId);

    // 상품 목록에 없으면 API에서 가져오기
    if (!product) {
      product = await getProduct(productId);
    }

    if (product) {
      appActions.addToCart(product, 1);
      console.log("장바구니에 추가되었습니다!");
    }
  } catch (error) {
    console.error("장바구니 추가 실패:", error);
    showToast("상품을 장바구니에 추가하는데 실패했습니다", "error");
  }
};

// 홈페이지 컴포넌트 생성
const createHomePageComponent = () => {
  let unsubscribe = null;
  const initialState = appStore.getState();
  let previousLoading = initialState.loading;
  let previousError = initialState.error;
  let previousIsInfiniteScrolling = initialState.isInfiniteScrolling;
  let previousProducts = initialState.products;
  let previousCartCount = initialState.cartCount;

  return createLifecycleComponent(
    {
      mount: () => {
        setupEventListeners();
        setupInfiniteScroll();

        unsubscribe = appStore.subscribe((state) => {
          if (state.currentRoute !== "home") return;

          if (
            state.loading !== previousLoading ||
            state.error !== previousError ||
            state.cartCount !== previousCartCount
          ) {
            previousLoading = state.loading;
            previousError = state.error;
            previousCartCount = state.cartCount;
            document.querySelector("#root").innerHTML = appState.currentPageComponent.render();
            setupEventListeners();

            if (appState.infiniteScroll) {
              appState.infiniteScroll.stop();
            }
            setupInfiniteScroll();
            return;
          }

          const isInfiniteScrollingChanged = state.isInfiniteScrolling !== previousIsInfiniteScrolling;
          const isProductsChanged = state.products !== previousProducts;

          if (isInfiniteScrollingChanged || isProductsChanged) {
            previousIsInfiniteScrolling = state.isInfiniteScrolling;
            previousProducts = state.products;

            updateProductList(state);

            if (appState.infiniteScroll) {
              appState.infiniteScroll.stop();
              appState.infiniteScroll.start();
            }
          }
        });
      },

      unmount: () => {
        if (appState.infiniteScroll) {
          appState.infiniteScroll.stop();
          appState.infiniteScroll = null;
        }
        if (unsubscribe) {
          unsubscribe();
        }
      },
    },
    () => {
      const state = appStore.getState();
      const params = getQueryParams();
      const category2List =
        params.category1 && state.categories[params.category1] ? Object.keys(state.categories[params.category1]) : [];

      return HomePage({
        loading: state.loading,
        error: state.error,
        products: state.products,
        categories: state.categories,
        selectedCategory1: params.category1,
        selectedCategory2: params.category2,
        category2List,
        totalCount: state.totalCount,
        isInfiniteScrolling: state.isInfiniteScrolling,
        hasMore: state.hasMore,
        cartCount: state.cartCount,
      });
    },
  );
};

// 상세페이지 컴포넌트 생성
const createDetailPageComponent = () => {
  let unsubscribe = null;
  const initialState = appStore.getState();
  let previousDetailLoading = initialState.detailLoading;
  let previousDetailError = initialState.detailError;
  let previousDetailProduct = initialState.detailProduct;
  let previousRelatedProducts = initialState.relatedProducts;
  let previousCartCount = initialState.cartCount;

  return createLifecycleComponent(
    {
      mount: () => {
        unsubscribe = appStore.subscribe((state) => {
          if (state.currentRoute !== "detail") return;

          const shouldRerender =
            state.detailLoading !== previousDetailLoading ||
            state.detailError !== previousDetailError ||
            state.detailProduct !== previousDetailProduct ||
            state.relatedProducts !== previousRelatedProducts ||
            state.cartCount !== previousCartCount;

          if (shouldRerender) {
            previousDetailLoading = state.detailLoading;
            previousDetailError = state.detailError;
            previousDetailProduct = state.detailProduct;
            previousRelatedProducts = state.relatedProducts;
            previousCartCount = state.cartCount;

            document.querySelector("#root").innerHTML = appState.currentPageComponent.render();
          }
        });
      },

      unmount: () => {
        if (unsubscribe) {
          unsubscribe();
        }
      },
    },
    () => {
      const state = appStore.getState();
      return DetailPage({
        loading: state.detailLoading,
        error: state.detailError,
        product: state.detailProduct,
        relatedProducts: state.relatedProducts,
        cartCount: state.cartCount,
      });
    },
  );
};

// 상세페이지 데이터 로드
const loadDetailPageData = async (productId) => {
  try {
    // 상품 상세 정보 조회
    const product = await getProduct(productId);

    if (!product) {
      appActions.setDetailError(new Error("상품을 찾을 수 없습니다"));
      return;
    }

    // 관련 상품 조회 (같은 카테고리)
    let relatedProducts = [];
    if (product.category1 && product.category2) {
      try {
        const data = await getProducts({
          category1: product.category1,
          category2: product.category2,
          limit: 4,
          page: 1,
        });
        relatedProducts = data.products.filter((p) => p.productId !== productId).slice(0, 2);
      } catch (error) {
        console.error("관련 상품 로드 실패:", error);
      }
    }

    appActions.setDetailProduct(product, relatedProducts);
  } catch (error) {
    console.error("상품 상세 정보 로드 실패:", error);
    appActions.setDetailError(error);
  }
};

// 홈페이지 데이터 로드
const loadHomePageData = async () => {
  appState.currentRequestId++;
  const requestId = appState.currentRequestId;
  const params = getQueryParams();

  appActions.startLoading();

  try {
    if (Object.keys(appState.categories).length === 0) {
      appState.categories = await getCategories();
      appActions.setCategories(appState.categories);
    }
  } catch (error) {
    console.error("카테고리 로드 실패", error);
  }

  try {
    const data = await getProducts(params);

    if (requestId !== appState.currentRequestId) {
      return;
    }

    appActions.setProducts(data.products, {
      total: data.pagination.total,
      hasNext: data.pagination.hasNext,
      page: data.pagination.page,
    });
  } catch (error) {
    if (requestId !== appState.currentRequestId) {
      return;
    }
    appActions.setError(error);
  }
};

// 무한 스크롤 설정
const setupInfiniteScroll = () => {
  appState.infiniteScroll = createInfiniteScroll({
    rootMargin: "100px",
    onLoadMore: async () => {
      const state = appStore.getState();

      if (!state.hasMore || state.isInfiniteScrolling) {
        return;
      }

      appActions.startInfiniteScroll();
      const params = getQueryParams();

      try {
        const data = await getProducts({
          ...params,
          page: state.currentPage + 1,
        });

        appActions.appendProducts(data.products, {
          total: data.pagination.total,
          hasNext: data.pagination.hasNext,
          page: data.pagination.page,
        });
      } catch (error) {
        console.error("추가 상품 로드 실패:", error);
        appStore.setState({ isInfiniteScrolling: false });
      }
    },
  });

  appState.infiniteScroll.start();
  appState.infiniteScroll.updateStatus({ hasMore: appStore.getState().hasMore });
};

// ProductList 업데이트
const updateProductList = (state) => {
  const productListContainer = document.querySelector(".mb-6");

  if (productListContainer) {
    productListContainer.outerHTML = ProductList({
      loading: state.loading,
      error: state.error,
      products: state.products,
      totalCount: state.totalCount,
      isInfiniteScrolling: state.isInfiniteScrolling,
      hasMore: state.hasMore,
    });
  }
};

// 이벤트 리스너 설정
const setupEventListeners = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const elements = {
    "#limit-select": urlParams.get("limit") || "20",
    "#sort-select": urlParams.get("sort") || "price_asc",
    "#search-input": urlParams.get("search") || "",
  };

  Object.entries(elements).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
    }
  });
};

// 라우터 초기화
const initRouter = () => {
  appState.router = createRouter();

  appState.router.addRoute("/", async () => {
    if (appState.currentPageComponent?.destroy) {
      appState.currentPageComponent.destroy();
    }

    appActions.setCurrentRoute("home");
    appState.currentPageComponent = createHomePageComponent();
    document.querySelector("#root").innerHTML = appState.currentPageComponent.render();

    await loadHomePageData();
  });

  appState.router.addRoute("/product/:id", async (params) => {
    if (appState.currentPageComponent?.destroy) {
      appState.currentPageComponent.destroy();
    }

    // 렌더링 전에 상세페이지 데이터 초기화
    appActions.startDetailLoading();
    appActions.setCurrentRoute("detail");
    appState.currentPageComponent = createDetailPageComponent();
    document.querySelector("#root").innerHTML = appState.currentPageComponent.render();

    await loadDetailPageData(params.id);
  });

  appState.router.setNotFound(() => {
    if (appState.currentPageComponent?.destroy) {
      appState.currentPageComponent.destroy();
    }

    appActions.setCurrentRoute("404");
    document.querySelector("#root").innerHTML = NotFoundPage();
  });

  setupLinkHandler(appState.router);
  appState.router.start();
};

// 이벤트버스 초기화
const initEventBus = () => {
  eventBus.on("products:appended", (data) => {
    console.log(`${data.count}개 상품 추가됨 (총 ${data.total}개)`);
  });

  eventBus.on("error", (data) => {
    console.error("에러 발생:", data.message);
    showToast(data.message || "오류가 발생했습니다", "error");
  });

  eventBus.on("detail:loaded", (data) => {
    console.log(`상품 상세 페이지 로드됨: ${data.productId}`);
  });

  eventBus.on("cart:added", (data) => {
    console.log(`장바구니에 추가됨: 상품 ID ${data.productId}, 수량 ${data.quantity}`);
    showToast("장바구니에 추가되었습니다", "success");
  });

  eventBus.on("cart:removed", (data) => {
    if (data.count) {
      console.log(`${data.count}개 상품이 장바구니에서 삭제됨`);
      showToast(`선택된 상품들이 삭제되었습니다 (${data.count}개)`, "info");
    } else {
      console.log(`상품 ID ${data.productId} 장바구니에서 삭제됨`);
      showToast("상품이 삭제되었습니다", "info");
    }
  });

  eventBus.on("cart:cleared", () => {
    console.log("장바구니 전체 비우기");
    showToast("장바구니를 비웠습니다", "info");
  });
};

// 장바구니 모달 렌더링
const renderCartModal = () => {
  const state = appStore.getState();
  const modalRoot = document.querySelector("#modal-root");

  if (!modalRoot) {
    const newModalRoot = document.createElement("div");
    newModalRoot.id = "modal-root";
    newModalRoot.className = "fixed inset-0 z-50 overflow-y-auto";
    newModalRoot.style.display = "none";
    document.body.appendChild(newModalRoot);
    return;
  }

  if (state.cartModalOpen) {
    modalRoot.style.display = "block";
    modalRoot.innerHTML = /*html*/ `
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay" id="cart-modal-overlay"></div>
      ${CartModal({ items: state.cart, selectedIds: state.cartSelectedIds })}
    `;

    // 모달 오버레이 클릭 시 닫기
    const overlay = document.querySelector("#cart-modal-overlay");
    overlay?.addEventListener("click", () => appActions.closeCartModal());
  } else {
    modalRoot.style.display = "none";
    modalRoot.innerHTML = "";
  }
};

// 장바구니 모달 구독
const setupCartModal = () => {
  // 초기 모달 루트 생성
  const modalRoot = document.createElement("div");
  modalRoot.id = "modal-root";
  modalRoot.className = "fixed inset-0 z-50 overflow-y-auto";
  modalRoot.style.display = "none";
  document.body.appendChild(modalRoot);

  // 장바구니 상태 변경 구독
  appStore.subscribe(() => {
    // 장바구니 모달 열림/닫힘 또는 장바구니 내용 변경
    renderCartModal();
  });
};

// 앱 초기화
export const initApp = () => {
  setupGlobalEventDelegation();
  setupCartModal();
  initRouter();
  initEventBus();
};
