import { getProduct, getProducts, getCategories } from "./api/productApi.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { store } from "./store/index.js";
import { CartModal } from "./components/index.js";
import { _404Page } from "./pages/404Page.js";

// 앱 상태
const appState = {
  currentPage: 1,
  products: [],
  allProducts: [],
  categories: {},
  filters: {
    search: "",
    category1: "",
    category2: "",
    sort: "price_asc",
    limit: 20,
  },
  hasMore: true,
  loading: false,
  loadingMore: false,
  totalCount: 0,
  cartModalOpen: false,
  selectedCartItems: [],
};

// 스크롤 이벤트 리스너 참조 (제거를 위해 저장)
let scrollEventListener = null;

// 유틸리티 함수
const showToast = (message = "장바구니에 추가되었습니다") => {
  // 모든 기존 토스트 제거 (중복 방지)
  const allToasts = document.querySelectorAll("#toast-container");
  allToasts.forEach((toast) => toast.remove());

  // body에 새 토스트 생성
  const body = document.body;
  if (!body) return;

  const toastHTML = `
    <div id="toast-container" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
      <div id="toast" class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <p id="toast-message" class="text-sm font-medium">${message}</p>
        <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
  body.insertAdjacentHTML("beforeend", toastHTML);
  const container = document.getElementById("toast-container");
  const toastMessage = document.getElementById("toast-message");

  if (!container || !toastMessage) return;

  toastMessage.textContent = message;

  // 기존 타이머 제거
  if (window.toastTimer) {
    clearTimeout(window.toastTimer);
  }

  // 즉시 표시하고 모든 visibility 속성 설정 (!important 사용)
  container.style.setProperty("display", "block", "important");
  container.style.setProperty("visibility", "visible", "important");
  container.style.setProperty("opacity", "1", "important");

  // 강제로 리플로우 발생시켜 브라우저가 렌더링하도록 함
  void container.offsetHeight;
  void container.offsetWidth;
  const computedStyle = window.getComputedStyle(container);
  void computedStyle.display;
  void computedStyle.visibility;
  void computedStyle.opacity;

  // 추가로 getBoundingClientRect를 호출하여 레이아웃 계산 강제
  const rect = container.getBoundingClientRect();
  void rect.width;
  void rect.height;

  // requestAnimationFrame을 사용하여 브라우저가 확실히 렌더링하도록 함
  requestAnimationFrame(() => {
    // root 내부의 토스트 다시 제거 (PageLayout이 재렌더링될 수 있음)
    const rootToast = document.querySelector("#root #toast-container");
    if (rootToast) {
      rootToast.remove();
    }

    if (container && container.isConnected) {
      container.style.setProperty("display", "block", "important");
      container.style.setProperty("visibility", "visible", "important");
      container.style.setProperty("opacity", "1", "important");
      void container.offsetHeight;
      void container.getBoundingClientRect();
    }
  });

  // 3초 후 자동 닫기
  window.toastTimer = setTimeout(() => {
    if (container && container.isConnected) {
      container.style.setProperty("display", "none", "important");
    }
  }, 3000);
};

const closeToast = () => {
  const container = document.getElementById("toast-container");
  if (container) {
    container.style.display = "none";
  }
  if (window.toastTimer) {
    clearTimeout(window.toastTimer);
  }
};

// 장바구니 모달 열기/닫기
const openCartModal = () => {
  appState.cartModalOpen = true;
  appState.selectedCartItems = [];
  renderCartModal();
};

const closeCartModal = () => {
  appState.cartModalOpen = false;
  const overlay = document.querySelector(".cart-modal-overlay");
  if (overlay) {
    overlay.remove();
  }
};

const renderCartModal = () => {
  let overlay = document.querySelector(".cart-modal-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "cart-modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50";
    document.body.appendChild(overlay);

    // overlay에 클릭 이벤트 추가 (배경 클릭 시 닫기) - 한 번만 추가
    overlay.addEventListener("click", (e) => {
      // currentTarget이 overlay이고, 모달 내부가 아닌 경우
      if (e.currentTarget === overlay) {
        const cartModal = e.target.closest(".cart-modal");
        if (!cartModal) {
          closeCartModal();
        }
      }
    });
  }

  // 최신 장바구니 상태 가져오기
  const cart = store.getCart();
  overlay.innerHTML = CartModal({ cart, selectedIds: appState.selectedCartItems || [] });

  // 모달이 열려있음을 표시
  appState.cartModalOpen = true;

  // 체크박스 change 이벤트 리스너 추가 (page.check()를 위해)
  const selectAllCheckbox = overlay.querySelector("#cart-modal-select-all-checkbox");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      const cart = store.getCart();
      if (e.target.checked) {
        appState.selectedCartItems = cart.map((item) => item.productId);
      } else {
        appState.selectedCartItems = [];
      }
      renderCartModal();
    });
  }

  // 개별 체크박스 change 이벤트 리스너 추가
  const itemCheckboxes = overlay.querySelectorAll(".cart-item-checkbox");
  itemCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const productId = e.target.dataset.productId;
      if (e.target.checked) {
        if (!appState.selectedCartItems.includes(productId)) {
          appState.selectedCartItems.push(productId);
        }
      } else {
        appState.selectedCartItems = appState.selectedCartItems.filter((id) => id !== productId);
      }
      renderCartModal();
    });
  });

  // 모달 이벤트는 전역 리스너에서 처리
};

// URL 파라미터 파싱
const parseQueryParams = (search) => {
  const params = new URLSearchParams(search);
  return {
    search: params.get("search") || "",
    category1: params.get("category1") || "",
    category2: params.get("category2") || "",
    sort: params.get("sort") || "price_asc",
    limit: parseInt(params.get("limit") || "20"),
  };
};

// URL 생성
const buildUrl = (path, filters) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category1) params.set("category1", filters.category1);
  if (filters.category2) params.set("category2", filters.category2);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.limit) params.set("limit", filters.limit.toString());

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

// 네비게이션
const navigateTo = (url) => {
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const fullUrl = basePath !== "/" ? basePath + url : url;
  history.pushState(null, null, fullUrl);
  render();
};

// 홈 페이지 렌더링
const renderHomePage = async () => {
  const $root = document.querySelector("#root");

  // URL에서 필터 파싱
  const filters = parseQueryParams(window.location.search);
  appState.filters = filters;
  appState.currentPage = 1;
  appState.products = [];
  appState.allProducts = [];

  // 로딩 상태로 렌더링
  $root.innerHTML = HomePage({
    filters,
    categories: appState.categories,
    products: [],
    loading: true,
    cartCount: store.getCartCount(),
  });

  // root 내부의 토스트 제거 (body에 직접 생성하므로)
  const rootToastLoading = $root.querySelector("#toast-container");
  if (rootToastLoading) {
    rootToastLoading.remove();
  }

  // 카테고리 로드 (아직 로드되지 않은 경우)
  if (Object.keys(appState.categories).length === 0) {
    appState.categories = await getCategories();
  }

  // 상품 로드
  const data = await getProducts({ ...filters, page: 1 });
  appState.products = data.products || [];
  appState.allProducts = [...appState.products];
  appState.totalCount = data.pagination?.total || data.products?.length || 0;
  appState.hasMore = appState.products.length < appState.totalCount;

  // 완료 상태로 렌더링
  $root.innerHTML = HomePage({
    filters,
    categories: appState.categories,
    products: appState.products,
    loading: false,
    cartCount: store.getCartCount(),
    hasMore: appState.hasMore,
    loadingMore: false,
    totalCount: appState.totalCount,
  });

  // root 내부의 토스트 제거 (body에 직접 생성하므로)
  const rootToast = $root.querySelector("#toast-container");
  if (rootToast) {
    rootToast.remove();
  }

  // 이벤트 리스너 설정
  setupHomePageListeners();
};

// 홈 페이지 이벤트 리스너
const setupHomePageListeners = () => {
  // 검색
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    // 기존 리스너 제거를 위해 클론 생성
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const newFilters = { ...appState.filters, search: newSearchInput.value };
        navigateTo(buildUrl("/", newFilters));
      }
    });
  }

  // 정렬
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const newFilters = { ...appState.filters, sort: e.target.value };
      navigateTo(buildUrl("/", newFilters));
    });
  }

  // 페이지당 상품 수
  const limitSelect = document.getElementById("limit-select");
  if (limitSelect) {
    limitSelect.addEventListener("change", (e) => {
      const newFilters = { ...appState.filters, limit: parseInt(e.target.value) };
      navigateTo(buildUrl("/", newFilters));
    });
  }

  // 무한 스크롤
  const handleScroll = async () => {
    // 홈페이지가 아니면 무시
    const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const pathName = window.location.pathname;
    let relativePath = pathName;
    if (basePath !== "/" && pathName.startsWith(basePath)) {
      relativePath = pathName.slice(basePath.length);
    }
    relativePath = relativePath.replace(/^\/+|\/+$/g, "");
    relativePath = relativePath ? "/" + relativePath : "/";

    if (relativePath !== "/") return;

    if (appState.loading || appState.loadingMore || !appState.hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // 하단에서 200px 이내에 도달하면 로드
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      appState.loadingMore = true;
      appState.currentPage += 1;

      // 로딩 표시 업데이트
      const $root = document.querySelector("#root");
      $root.innerHTML = HomePage({
        filters: appState.filters,
        categories: appState.categories,
        products: appState.products,
        loading: false,
        cartCount: store.getCartCount(),
        hasMore: appState.hasMore,
        loadingMore: true,
        totalCount: appState.totalCount,
      });

      // 추가 상품 로드
      const data = await getProducts({ ...appState.filters, page: appState.currentPage });
      const newProducts = data.products || [];
      appState.products = [...appState.products, ...newProducts];
      appState.allProducts = [...appState.products];
      appState.hasMore = appState.products.length < appState.totalCount;
      appState.loadingMore = false;

      // 재렌더링
      $root.innerHTML = HomePage({
        filters: appState.filters,
        categories: appState.categories,
        products: appState.products,
        loading: false,
        cartCount: store.getCartCount(),
        hasMore: appState.hasMore,
        loadingMore: false,
        totalCount: appState.totalCount,
      });

      // 이벤트 리스너 재설정
      setupHomePageListeners();
    }
  };

  // 이전 스크롤 리스너 제거
  if (scrollEventListener) {
    window.removeEventListener("scroll", scrollEventListener);
  }

  // 새 스크롤 리스너 추가
  scrollEventListener = handleScroll;
  window.addEventListener("scroll", scrollEventListener);
};

// 상세 페이지 렌더링
const renderDetailPage = async (productId) => {
  const $root = document.querySelector("#root");

  // 로딩 상태로 렌더링
  $root.innerHTML = DetailPage({
    loading: true,
    cartCount: store.getCartCount(),
  });

  // root 내부의 토스트 제거 (body에 직접 생성하므로)
  const rootToastLoadingDetail = $root.querySelector("#toast-container");
  if (rootToastLoadingDetail) {
    rootToastLoadingDetail.remove();
  }

  // 상품 상세 정보 로드
  const product = await getProduct(productId);

  // 전역 상태에 현재 상품 저장
  appState.currentProduct = product;

  // 관련 상품 로드 (같은 카테고리의 다른 상품들)
  let relatedProducts = [];
  if (product.category2) {
    const relatedData = await getProducts({
      category1: product.category1,
      category2: product.category2,
      limit: 10,
    });
    relatedProducts = (relatedData.products || []).filter((p) => p.productId !== productId);
  }

  // 완료 상태로 렌더링
  $root.innerHTML = DetailPage({
    product,
    loading: false,
    cartCount: store.getCartCount(),
    relatedProducts,
  });

  // root 내부의 토스트 제거 (body에 직접 생성하므로)
  const rootToast = $root.querySelector("#toast-container");
  if (rootToast) {
    rootToast.remove();
  }

  // 상세페이지에서는 스크롤 이벤트 리스너 제거
  if (scrollEventListener) {
    window.removeEventListener("scroll", scrollEventListener);
    scrollEventListener = null;
  }

  // 이벤트 리스너는 전역 리스너에서 처리
};

// 전역 이벤트 리스너 (한 번만 설정)
let globalListenersSetup = false;

const setupGlobalListeners = () => {
  if (globalListenersSetup) return;
  globalListenersSetup = true;

  // 모든 클릭 이벤트를 처리
  document.addEventListener("click", (e) => {
    const target = e.target;

    // 카테고리 버튼 클릭 (가장 먼저 체크)
    // 버튼 자체이거나 버튼 내부 요소일 수 있으므로 closest 사용
    const categoryBtn = target.closest("[data-category1]");
    if (categoryBtn && !categoryBtn.hasAttribute("data-breadcrumb")) {
      e.preventDefault();
      e.stopPropagation();
      const category1 = categoryBtn.dataset.category1;
      const category2 = categoryBtn.dataset.category2;

      // 현재 URL에서 필터 파싱 (최신 상태 보장)
      const currentFilters = parseQueryParams(window.location.search);

      if (category2) {
        // 2depth 카테고리 선택
        const newFilters = { ...currentFilters, category1, category2 };
        const url = buildUrl("/", newFilters);
        navigateTo(url);
      } else if (category1) {
        // 1depth 카테고리 선택
        const newFilters = { ...currentFilters, category1, category2: "" };
        const url = buildUrl("/", newFilters);
        navigateTo(url);
      }
      return;
    }

    // 브레드크럼 클릭
    const breadcrumbBtn = target.closest("[data-breadcrumb]");
    if (breadcrumbBtn) {
      e.preventDefault();
      const type = breadcrumbBtn.dataset.breadcrumb;
      if (type === "reset") {
        navigateTo(buildUrl("/", { ...appState.filters, category1: "", category2: "", search: "" }));
      } else if (type === "category1") {
        const category1 = breadcrumbBtn.dataset.category1;
        navigateTo(buildUrl("/", { ...appState.filters, category1, category2: "" }));
      }
      return;
    }

    // 장바구니 아이콘 클릭
    const cartIcon = target.closest("#cart-icon-btn");
    if (cartIcon) {
      openCartModal();
      return;
    }

    // 토스트 닫기 버튼
    const toastCloseBtn = target.closest("#toast-close-btn");
    if (toastCloseBtn) {
      closeToast();
      return;
    }

    // 닫기 버튼 (가장 먼저 체크)
    const closeBtn = target.closest("#cart-modal-close-btn");
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      closeCartModal();
      return;
    }

    // 장바구니 모달 이벤트들
    const cartModal = target.closest(".cart-modal");
    if (cartModal) {
      // 수량 증가 버튼
      const quantityIncreaseBtn = target.closest(".quantity-increase-btn");
      if (quantityIncreaseBtn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = quantityIncreaseBtn.dataset.productId;
        const cart = store.getCart();
        const item = cart.find((item) => item.productId === productId);
        if (item && item.quantity < 99) {
          const newQuantity = item.quantity + 1;
          store.updateCartItemQuantity(productId, newQuantity);
          // 모달이 열려있으면 즉시 업데이트 (모달이 닫히지 않도록)
          // overlay가 존재하는지 확인하고 업데이트
          const overlay = document.querySelector(".cart-modal-overlay");
          if (overlay) {
            // 모달이 열려있음을 명시적으로 표시
            appState.cartModalOpen = true;
            // 모달 즉시 업데이트
            renderCartModal();
          }
        }
        return;
      }

      // 수량 감소 버튼
      const quantityDecreaseBtn = target.closest(".quantity-decrease-btn");
      if (quantityDecreaseBtn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = quantityDecreaseBtn.dataset.productId;
        const cart = store.getCart();
        const item = cart.find((item) => item.productId === productId);
        if (item && item.quantity > 1) {
          store.updateCartItemQuantity(productId, item.quantity - 1);
          // 모달이 열려있으면 즉시 업데이트 (모달이 닫히지 않도록)
          // overlay가 존재하는지 확인하고 업데이트
          const overlay = document.querySelector(".cart-modal-overlay");
          if (overlay) {
            // 모달이 열려있음을 명시적으로 표시
            appState.cartModalOpen = true;
            renderCartModal();
          }
        }
        return;
      }

      // 개별 상품 삭제 버튼
      const removeBtn = target.closest(".cart-item-remove-btn");
      if (removeBtn) {
        e.stopPropagation();
        const productId = removeBtn.dataset.productId;
        store.removeFromCart(productId);
        appState.selectedCartItems = appState.selectedCartItems.filter((id) => id !== productId);
        renderCartModal();
        // 장바구니 아이콘 업데이트
        const cartIconSpan = document.querySelector("#cart-icon-btn span");
        const cartCount = store.getCartCount();
        if (cartCount > 0 && cartIconSpan) {
          cartIconSpan.textContent = cartCount;
        } else if (cartCount === 0 && cartIconSpan) {
          cartIconSpan.remove();
        }
        return;
      }

      // 전체 선택 체크박스
      const selectAllCheckbox = target.closest("#cart-modal-select-all-checkbox");
      if (selectAllCheckbox) {
        e.stopPropagation();
        const cart = store.getCart();
        if (selectAllCheckbox.checked) {
          appState.selectedCartItems = cart.map((item) => item.productId);
        } else {
          appState.selectedCartItems = [];
        }
        renderCartModal();
        return;
      }

      // 개별 체크박스
      const itemCheckbox = target.closest(".cart-item-checkbox");
      if (itemCheckbox) {
        const productId = itemCheckbox.dataset.productId;
        if (itemCheckbox.checked) {
          if (!appState.selectedCartItems.includes(productId)) {
            appState.selectedCartItems.push(productId);
          }
        } else {
          appState.selectedCartItems = appState.selectedCartItems.filter((id) => id !== productId);
        }
        renderCartModal();
        return;
      }

      // 선택 삭제 버튼
      const removeSelectedBtn = target.closest("#cart-modal-remove-selected-btn");
      if (removeSelectedBtn) {
        e.stopPropagation();
        appState.selectedCartItems.forEach((productId) => {
          store.removeFromCart(productId);
        });
        appState.selectedCartItems = [];
        renderCartModal();
        // 장바구니 아이콘 업데이트
        const cartIconSpan = document.querySelector("#cart-icon-btn span");
        const cartCount = store.getCartCount();
        if (cartCount > 0 && cartIconSpan) {
          cartIconSpan.textContent = cartCount;
        } else if (cartCount === 0 && cartIconSpan) {
          cartIconSpan.remove();
        }
        showToast("선택된 상품들이 삭제되었습니다");
        return;
      }

      // 전체 비우기 버튼
      const clearCartBtn = target.closest("#cart-modal-clear-cart-btn");
      if (clearCartBtn) {
        e.stopPropagation();
        store.clearCart();
        appState.selectedCartItems = [];
        renderCartModal();
        // 장바구니 아이콘 업데이트
        const cartIconSpan = document.querySelector("#cart-icon-btn span");
        if (cartIconSpan) {
          cartIconSpan.remove();
        }
        return;
      }

      // 상품 이미지/제목 클릭 시 상세 페이지로
      const cartItemImage = target.closest(".cart-item-image");
      const cartItemTitle = target.closest(".cart-item-title");
      if (cartItemImage || cartItemTitle) {
        const cartItem = target.closest(".cart-item");
        if (cartItem) {
          const productId = cartItem.dataset.productId;
          closeCartModal();
          navigateTo(`/product/${productId}`);
        }
        return;
      }

      // 모달 내부 클릭 시 이벤트 전파 중단 (배경 클릭으로 닫히지 않도록)
      e.stopPropagation();
      return;
    }

    // 배경 클릭은 overlay에 직접 이벤트 리스너로 처리됨

    // 페이지별 이벤트들
    const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const pathName = window.location.pathname;
    // basePath를 제거한 상대 경로 추출
    let relativePath = pathName;
    if (basePath !== "/" && pathName.startsWith(basePath)) {
      relativePath = pathName.slice(basePath.length);
    }
    // 앞뒤 슬래시 정리하고 항상 /로 시작하도록
    relativePath = relativePath.replace(/^\/+|\/+$/g, "");
    relativePath = relativePath ? "/" + relativePath : "/";
    const main = target.closest("main");

    // 뒤로 가기 버튼 (상세 페이지 헤더에 있으므로 main 조건 없이 체크)
    if (relativePath.startsWith("/product/")) {
      const backBtn = target.closest("#back-btn");
      if (backBtn) {
        e.preventDefault();
        e.stopPropagation();
        history.back();
        return;
      }
    }

    // 상세 페이지 이벤트
    if (main && relativePath.startsWith("/product/")) {
      // 수량 증가 버튼
      const quantityIncrease = target.closest("#quantity-increase");
      if (quantityIncrease) {
        const quantityInput = document.getElementById("quantity-input");
        if (quantityInput) {
          const currentValue = parseInt(quantityInput.value);
          const maxValue = parseInt(quantityInput.max);
          if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
          }
        }
        return;
      }

      // 수량 감소 버튼
      const quantityDecrease = target.closest("#quantity-decrease");
      if (quantityDecrease) {
        const quantityInput = document.getElementById("quantity-input");
        if (quantityInput) {
          const currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
          }
        }
        return;
      }

      // 장바구니 담기 버튼
      const addToCartBtn = target.closest("#add-to-cart-btn");
      if (addToCartBtn) {
        e.stopPropagation();
        e.preventDefault();
        const quantityInput = document.getElementById("quantity-input");
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        // 현재 상품 정보 가져오기 (전역에서 접근 가능하도록 저장되어 있어야 함)
        const product = appState.currentProduct;
        if (product) {
          store.addToCart(product, quantity);
          const cartIconSpan = document.querySelector("#cart-icon-btn span");
          const cartCount = store.getCartCount();
          if (cartCount > 0) {
            if (cartIconSpan) {
              cartIconSpan.textContent = cartCount;
            } else {
              const cartIconBtn = document.getElementById("cart-icon-btn");
              if (cartIconBtn) {
                const newSpan = document.createElement("span");
                newSpan.className =
                  "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
                newSpan.textContent = cartCount;
                cartIconBtn.appendChild(newSpan);
              }
            }
          }
          showToast("장바구니에 추가되었습니다");
        }
        return;
      }

      // 관련 상품 클릭
      const relatedProductCard = target.closest(".related-product-card");
      if (relatedProductCard) {
        const productId = relatedProductCard.dataset.productId;
        navigateTo(`/product/${productId}`);
        return;
      }

      // 브레드크럼 카테고리 클릭
      const breadcrumbLink = target.closest(".breadcrumb-link");
      if (breadcrumbLink) {
        e.preventDefault();
        const category1 = breadcrumbLink.dataset.category1;
        const category2 = breadcrumbLink.dataset.category2;
        const filters = { search: "", category1, category2: category2 || "", sort: "price_asc", limit: 20 };
        navigateTo(buildUrl("/", filters));
        return;
      }

      // 홈 링크
      const homeLink = target.closest('a[href="/"]');
      if (homeLink && homeLink.hasAttribute("data-link")) {
        e.preventDefault();
        navigateTo("/");
        return;
      }

      // 상품 목록으로 돌아가기
      const goToListBtn = target.closest(".go-to-product-list");
      if (goToListBtn) {
        navigateTo("/");
        return;
      }
    }

    // 홈 페이지 이벤트들
    if (main && relativePath === "/") {
      // 장바구니 담기 버튼 (가장 먼저 체크)
      const addToCartBtn = target.closest(".add-to-cart-btn");
      if (addToCartBtn) {
        e.stopPropagation();
        e.preventDefault();
        const productId = addToCartBtn.dataset.productId;
        const product = appState.products.find((p) => p.productId === productId);

        if (product) {
          store.addToCart(product, 1);
          // 장바구니 아이콘의 숫자만 업데이트 (전체 render 대신)
          const cartIconSpan = document.querySelector("#cart-icon-btn span");
          const cartCount = store.getCartCount();
          if (cartCount > 0) {
            if (cartIconSpan) {
              cartIconSpan.textContent = cartCount;
            } else {
              const cartIconBtn = document.getElementById("cart-icon-btn");
              if (cartIconBtn) {
                const newSpan = document.createElement("span");
                newSpan.className =
                  "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
                newSpan.textContent = cartCount;
                cartIconBtn.appendChild(newSpan);
              }
            }
          }
          showToast("장바구니에 추가되었습니다");
        }
        return;
      }

      // 상품 카드 클릭 (이미지 또는 정보 영역)
      const productImage = target.closest(".product-image");
      const productInfo = target.closest(".product-info");
      if (productImage || productInfo) {
        const card = target.closest(".product-card");
        if (card) {
          const productId = card.dataset.productId;
          navigateTo(`/product/${productId}`);
        }
        return;
      }
    }
  });

  // popstate 이벤트 (뒤로가기/앞으로가기)
  window.addEventListener("popstate", () => {
    render();
  });

  // ESC 키로 장바구니 모달 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && appState.cartModalOpen) {
      closeCartModal();
    }
  });
};

// 메인 렌더 함수
const render = async () => {
  const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const pathName = window.location.pathname;
  let relativePath = pathName;

  // basePath 제거
  if (basePath !== "/" && pathName.startsWith(basePath)) {
    relativePath = pathName.slice(basePath.length);
  }

  // 앞뒤 슬래시 정리하고 항상 /로 시작하도록
  relativePath = relativePath.replace(/^\/+|\/+$/g, "");
  relativePath = relativePath ? "/" + relativePath : "/";

  // 장바구니 모달이 열려있으면 업데이트
  if (appState.cartModalOpen) {
    renderCartModal();
  }

  if (relativePath === "/") {
    await renderHomePage();
  } else if (relativePath.startsWith("/product/")) {
    const productId = relativePath.replace("/product/", "");
    await renderDetailPage(productId);
  } else {
    // 404 페이지
    const $root = document.querySelector("#root");
    $root.innerHTML = _404Page();

    // "홈으로" 링크 이벤트 리스너 설정
    const homeLink = document.querySelector('a[href="/"][data-link]');
    if (homeLink) {
      homeLink.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("/");
      });
    }
  }
};

// MSW 활성화
const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 앱 시작
const main = async () => {
  setupGlobalListeners();
  await render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
