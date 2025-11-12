import { store } from "../store.js";
import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { MainPage } from "./pages/MainPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

let searchKeyHandlerAttached = false;
let searchHandlerRef = null;
let detailFetchId = null;
let detailFetchPromise = null;

const syncQueryParam = (key, value, defaultValue = "") => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const shouldRemove = value === undefined || value === null || value === "" || value === defaultValue;

  if (shouldRemove) {
    params.delete(key);
  } else {
    params.set(key, value);
  }

  const queryString = params.toString();
  const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  history.replaceState(null, "", nextUrl);
};

const searchKeyHandler = (runSearch) => {
  searchHandlerRef = runSearch;
  if (searchKeyHandlerAttached) return;

  document.addEventListener("keydown", (event) => {
    // ESC 키로 장바구니 모달 닫기
    if (event.key === "Escape" && store.state.isCartModalOpen) {
      store.setState({ isCartModalOpen: false });
      return;
    }

    // Enter 키로 검색
    if (event.key !== "Enter") return;

    const target = event.target;
    if (!target || target.id !== "search-input") return;

    event.preventDefault();
    const input = target.value ?? "";
    if (typeof searchHandlerRef === "function") {
      searchHandlerRef(input);
    }
  });

  searchKeyHandlerAttached = true;
};

const getProductIdFromPath = (path) => {
  const match = /^\/products\/([^/]+)$/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
};

// 필터 상태 추적
let lastFilters = {
  search: "",
  category1: "",
  category2: "",
  sort: "price_asc",
  limit: "20",
};

const render = () => {
  // 렌더될 root 요소
  const $root = document.getElementById("root");
  // API fetch 여부
  let isFetchingProducts = false;

  // 제품 목록 로드
  const loadProducts = async (page = 1, append = false) => {
    if (isFetchingProducts) return;
    if (store.state.path !== "/") return;
    if (!append && store.state.isLoaded && !store.state.error) return;

    isFetchingProducts = true;
    store.setState({ error: null, isLoadingMore: append });

    try {
      if (!store.state.categories || !Object.keys(store.state.categories).length) {
        try {
          const categories = await getCategories();
          store.setState({ categories });
        } catch (err) {
          console.error("카테고리 로드 실패:", err);
        }
      }

      const products = await getProducts({
        page,
        limit: Number(store.state.limit) || 20,
        sort: store.state.sort,
        search: store.state.search,
        category1: store.state.category1,
        category2: store.state.category2,
      });

      if (append && store.state.products?.products) {
        const existingProducts = store.state.products.products;
        store.setState({
          products: {
            ...products,
            products: [...existingProducts, ...products.products],
          },
          currentPage: page,
          hasMore: products.pagination.hasNext,
          isLoaded: true,
          isLoadingMore: false,
        });
      } else {
        store.setState({
          products,
          currentPage: page,
          hasMore: products.pagination.hasNext,
          isLoaded: true,
          isLoadingMore: false,
        });
      }
    } catch (err) {
      console.error("상품 로드 실패:", err);
      store.setState({
        error: err.message || "상품을 불러오는 중 오류가 발생했습니다",
        isLoaded: false,
        isLoadingMore: false,
      });
    } finally {
      isFetchingProducts = false;
    }
  };

  // 재시도
  const retryLoadProducts = () => {
    store.setState({ error: null, isLoaded: false, currentPage: 1, hasMore: true });
    loadProducts(1, false);
  };

  // 더 많은 상품 로드 (무한 스크롤)
  const loadMoreProducts = () => {
    if (isFetchingProducts || !store.state.hasMore || store.state.isLoadingMore) return;
    if (store.state.path !== "/") return;

    const nextPage = store.state.currentPage + 1;
    loadProducts(nextPage, true);
  };

  const fetchProductDetail = async (productId) => {
    if (!productId) return false;

    if (store.state.currentProduct?.productId === productId) {
      return true;
    }

    if (detailFetchPromise && detailFetchId === productId) {
      return detailFetchPromise;
    }

    detailFetchId = productId;
    detailFetchPromise = (async () => {
      try {
        const currentProduct = await getProduct(productId);
        if (!currentProduct || !currentProduct.productId) {
          return false;
        }

        let relatedProducts = await getProducts({ category2: currentProduct.category2 });
        relatedProducts = relatedProducts.products.filter((product) => product.productId !== productId);
        store.setState({ currentProduct, relatedProducts });
        return true;
      } catch (err) {
        console.error("상품 상세 로드 실패:", err);
        return false;
      }
    })();

    try {
      return await detailFetchPromise;
    } finally {
      detailFetchPromise = null;
      detailFetchId = null;
    }
  };

  const handleStateChange = async (state) => {
    // 404 처리
    if (state.path !== "/" && !getProductIdFromPath(state.path)) {
      $root.innerHTML = NotFoundPage();
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    // 모달 상태나 장바구니 상태가 변경되면 현재 페이지를 다시 렌더링
    if (state.path === "/") {
      // 필터 변경은 이미 클릭 이벤트에서 처리되므로, 여기서는 초기 로드만 처리
      if (!state.isLoaded && !state.error && !isFetchingProducts) {
        loadProducts(1, false);
      }

      $root.innerHTML = MainPage();
      return;
    }

    const productId = getProductIdFromPath(state.path);
    if (productId) {
      const success = await fetchProductDetail(productId);
      if (success) {
        $root.innerHTML = ProductDetailPage();
      } else {
        $root.innerHTML = NotFoundPage();
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    $root.innerHTML = NotFoundPage();
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // navigate 처리
  const navigate = (path) => {
    if (path === store.state.path) return;
    history.pushState(null, "", path);
    store.setState({ path });
  };

  // 클릭 이벤트
  document.body.addEventListener("click", async (e) => {
    // 상품 목록에서 장바구니 담기 (상품 카드 클릭보다 먼저 처리)
    const $addToCartBtn = e.target.closest(".add-to-cart-btn");
    if ($addToCartBtn) {
      e.stopPropagation(); // 이벤트 전파 중지
      const productId = $addToCartBtn.dataset.productId;
      if (!productId) return;

      // 상품 목록에서 상품 정보 찾기
      const product = store.state.products?.products?.find((p) => p.productId === productId);
      if (!product) return;

      const existingCart = [...store.state.cartList];
      const existingItemIndex = existingCart.findIndex((item) => item.productId === productId);

      let cartList;

      if (existingItemIndex !== -1) {
        cartList = existingCart.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      } else {
        cartList = [
          ...existingCart,
          {
            productId: product.productId,
            title: product.title,
            price: product.lprice,
            image: product.image,
            quantity: 1,
            isSelected: false,
          },
        ];
      }

      store.setState({ cartList, toastState: "addCart" });
      setTimeout(() => {
        store.setState({ toastState: "" });
      }, 3000);
      return;
    }

    // 상품 카드 클릭 (장바구니 버튼이 아닌 경우만)
    const $productCard = e.target.closest(".product-card") || e.target.closest(".related-product-card");
    if ($productCard && !e.target.closest(".add-to-cart-btn")) {
      const productId = $productCard.dataset.productId;
      navigate(`/products/${productId}`);

      const currentProduct = await getProduct(productId);
      let relatedProducts = await getProducts({ category2: currentProduct.category2 });

      relatedProducts = relatedProducts.products.filter((product) => {
        return product.productId !== productId;
      });
      store.setState({ currentProduct, relatedProducts: relatedProducts });
      return;
    }

    // 장바구니 모달 열기
    const $cartIconBtn = e.target.closest("#cart-icon-btn");
    if ($cartIconBtn) {
      store.setState({ isCartModalOpen: true });
      return;
    }

    // 장바구니 모달 닫기
    const $cartModalCloseBtn = e.target.closest("#cart-modal-close-btn");
    if ($cartModalCloseBtn) {
      store.setState({ isCartModalOpen: false });
      return;
    }

    // 배경 오버레이 클릭 시 모달 닫기
    const $cartModalOverlay = e.target.closest("#cart-modal-overlay");
    if ($cartModalOverlay) {
      store.setState({ isCartModalOpen: false });
      return;
    }

    // 장바구니 아이템 수량 감소
    const $cartQuantityDecrease = e.target.closest(".quantity-decrease-btn");
    if ($cartQuantityDecrease) {
      const productId = $cartQuantityDecrease.dataset.productId;
      const cartList = [...store.state.cartList];
      const itemIndex = cartList.findIndex((item) => item.productId === productId);
      if (itemIndex !== -1 && cartList[itemIndex].quantity > 1) {
        cartList[itemIndex] = {
          ...cartList[itemIndex],
          quantity: cartList[itemIndex].quantity - 1,
        };
        store.setState({ cartList });
      }
      return;
    }

    // 장바구니 아이템 수량 증가
    const $cartQuantityIncrease = e.target.closest(".quantity-increase-btn");
    if ($cartQuantityIncrease) {
      const productId = $cartQuantityIncrease.dataset.productId;
      const cartList = [...store.state.cartList];
      const itemIndex = cartList.findIndex((item) => item.productId === productId);
      if (itemIndex !== -1) {
        cartList[itemIndex] = {
          ...cartList[itemIndex],
          quantity: cartList[itemIndex].quantity + 1,
        };
        store.setState({ cartList });
      }
      return;
    }

    // 장바구니 아이템 개별 삭제
    const $cartItemRemoveBtn = e.target.closest(".cart-item-remove-btn");
    if ($cartItemRemoveBtn) {
      const productId = $cartItemRemoveBtn.dataset.productId;
      const cartList = store.state.cartList.filter((item) => item.productId !== productId);
      store.setState({ cartList, toastState: "selectDelete" });
      setTimeout(() => {
        store.setState({ toastState: "" });
      }, 3000);
      return;
    }

    // 장바구니 아이템 클릭 시 상세 페이지로 이동
    const $cartItemImage = e.target.closest(".cart-item-image");
    const $cartItemTitle = e.target.closest(".cart-item-title");
    if ($cartItemImage || $cartItemTitle) {
      const productId = ($cartItemImage || $cartItemTitle).dataset.productId;
      if (productId) {
        store.setState({ isCartModalOpen: false });
        navigate(`/products/${productId}`);
        const currentProduct = await getProduct(productId);
        let relatedProducts = await getProducts({ category2: currentProduct.category2 });
        relatedProducts = relatedProducts.products.filter((product) => product.productId !== productId);
        store.setState({ currentProduct, relatedProducts });
      }
      return;
    }

    // 장바구니 아이템 개별 선택
    const $cartItemCheckbox = e.target.closest(".cart-item-checkbox");
    if ($cartItemCheckbox) {
      const productId = $cartItemCheckbox.dataset.productId;
      const cartList = store.state.cartList.map((item) =>
        item.productId === productId ? { ...item, isSelected: !item.isSelected } : item,
      );
      store.setState({ cartList });
      return;
    }

    // 장바구니 전체 선택
    const $cartSelectAllCheckbox = e.target.closest("#cart-modal-select-all-checkbox");
    if ($cartSelectAllCheckbox) {
      const isChecked = $cartSelectAllCheckbox.checked;
      const cartList = store.state.cartList.map((item) => ({ ...item, isSelected: isChecked }));
      store.setState({ cartList });
      return;
    }

    // 장바구니 선택 삭제
    const $cartRemoveSelectedBtn = e.target.closest("#cart-modal-remove-selected-btn");
    if ($cartRemoveSelectedBtn) {
      const cartList = store.state.cartList.filter((item) => !item.isSelected);
      store.setState({ cartList, toastState: "selectDelete" });
      setTimeout(() => {
        store.setState({ toastState: "" });
      }, 3000);
      return;
    }

    // 장바구니 전체 비우기
    const $cartClearCartBtn = e.target.closest("#cart-modal-clear-cart-btn");
    if ($cartClearCartBtn) {
      store.setState({ cartList: [], toastState: "allDelete" });
      setTimeout(() => {
        store.setState({ toastState: "" });
      }, 3000);
      return;
    }

    // 상품 상세 페이지 수량 조절
    const $quantityDecrease = e.target.closest("#quantity-decrease") || e.target.closest("#quantity-decrease-btn");
    const $quantityIncrease = e.target.closest("#quantity-increase") || e.target.closest("#quantity-increase-btn");
    const $quantityInput = document.getElementById("quantity-input");
    if ($quantityDecrease && $quantityInput && Number($quantityInput.value) > 1) {
      $quantityInput.value = Number($quantityInput.value) - 1;
      return;
    }
    if ($quantityIncrease && $quantityInput && store.state.currentProduct?.stock) {
      if (Number($quantityInput.value) < store.state.currentProduct.stock) {
        $quantityInput.value = Number($quantityInput.value) + 1;
      }
      return;
    }

    // 상품 상세 페이지 장바구니 담기
    const $detailAddToCartBtn = e.target.closest("#add-to-cart-btn");
    if ($detailAddToCartBtn) {
      const currentProduct = store.state.currentProduct;
      if (!currentProduct || !currentProduct.productId) return;

      const $input = document.getElementById("quantity-input");
      const quantity = $input ? Number($input.value) : 1;
      const existingCart = [...store.state.cartList];
      const existingItemIndex = existingCart.findIndex((item) => item.productId === currentProduct.productId);

      let cartList;

      if (existingItemIndex !== -1) {
        cartList = existingCart.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        );
      } else {
        cartList = [
          ...existingCart,
          {
            productId: currentProduct.productId,
            title: currentProduct.title,
            price: currentProduct.lprice,
            image: currentProduct.image,
            quantity: quantity,
            isSelected: false,
          },
        ];
      }

      store.setState({ cartList, toastState: "addCart" });
      setTimeout(() => {
        store.setState({ toastState: "" });
      }, 3000);
      return;
    }

    // 토스트 닫기
    const $toastCloseBtn = e.target.closest("#toast-close-btn");
    if ($toastCloseBtn) {
      store.setState({ toastState: "" });
      return;
    }

    // 에러 재시도 버튼
    const $errorRetryBtn = e.target.closest("#error-retry-btn");
    if ($errorRetryBtn) {
      retryLoadProducts();
      return;
    }

    // 카테고리 필터 - 전체
    const $categoryResetBtn = e.target.closest("[data-breadcrumb='reset']");
    if ($categoryResetBtn) {
      e.preventDefault();
      store.setState({ category1: "", category2: "", isLoaded: false, currentPage: 1, hasMore: true, error: null });
      syncQueryParam("category1", "");
      syncQueryParam("category2", "");
      lastFilters = { ...lastFilters, category1: "", category2: "" };
      if (store.state.path === "/" && !isFetchingProducts) {
        loadProducts(1, false);
      }
      return;
    }

    // 카테고리 필터 - 1depth
    const $category1Btn = e.target.closest(".category1-filter-btn");
    if ($category1Btn) {
      const category1 = $category1Btn.dataset.category1;
      if (category1 && category1 !== store.state.category1) {
        store.setState({ category1, category2: "", isLoaded: false, currentPage: 1, hasMore: true, error: null });
        syncQueryParam("category1", category1);
        syncQueryParam("category2", "");
        lastFilters = { ...lastFilters, category1, category2: "" };
        if (store.state.path === "/" && !isFetchingProducts) {
          loadProducts(1, false);
        }
      }
      return;
    }

    // 카테고리 필터 - 2depth
    const $category2Btn = e.target.closest(".category2-filter-btn");
    if ($category2Btn) {
      const category2 = $category2Btn.dataset.category2;
      if (category2 && category2 !== store.state.category2) {
        store.setState({ category2, isLoaded: false, currentPage: 1, hasMore: true, error: null });
        syncQueryParam("category2", category2);
        lastFilters = { ...lastFilters, category2 };
        if (store.state.path === "/" && !isFetchingProducts) {
          loadProducts(1, false);
        }
      }
      return;
    }

    // 브레드크럼 클릭
    const $breadcrumbLink = e.target.closest(".breadcrumb-link");
    if ($breadcrumbLink) {
      e.preventDefault();
      const category1 = $breadcrumbLink.dataset.category1;
      const category2 = $breadcrumbLink.dataset.category2;

      if (category1) {
        navigate("/");
        store.setState({ category1, category2: "", isLoaded: false, currentPage: 1, hasMore: true, error: null });
        syncQueryParam("category1", category1);
        syncQueryParam("category2", "");
        lastFilters = { ...lastFilters, category1, category2: "" };
        if (!isFetchingProducts) {
          loadProducts(1, false);
        }
      } else if (category2) {
        navigate("/");
        store.setState({ category2, isLoaded: false, currentPage: 1, hasMore: true, error: null });
        syncQueryParam("category2", category2);
        lastFilters = { ...lastFilters, category2 };
        if (!isFetchingProducts) {
          loadProducts(1, false);
        }
      }
      return;
    }

    // 상품 목록으로 돌아가기 버튼
    const $goToProductListBtn = e.target.closest(".go-to-product-list");
    if ($goToProductListBtn) {
      e.preventDefault();
      const currentProduct = store.state.currentProduct;
      const category1 = currentProduct?.category1 || "";
      const category2 = currentProduct?.category2 || "";

      // 카테고리 정보를 유지하면서 메인 페이지로 이동
      navigate("/");
      store.setState({
        category1,
        category2,
        isLoaded: false,
        currentPage: 1,
        hasMore: true,
        error: null,
      });
      syncQueryParam("category1", category1);
      syncQueryParam("category2", category2);
      lastFilters = { ...lastFilters, category1, category2 };
      if (!isFetchingProducts) {
        loadProducts(1, false);
      }
      return;
    }

    const $link = e.target.closest("[data-link]");
    if ($link) {
      e.preventDefault();
      navigate($link.getAttribute("href") || "/");
    }
  });

  document.body.addEventListener("input", (e) => {
    const target = e.target;
    if (!target) return;

    if (target.id === "quantity-input") {
      target.value = Math.min(target.value, store.state.currentProduct.stock);
    }
  });

  document.body.addEventListener("change", (e) => {
    const target = e.target;
    if (!target) return;

    if (target.id === "sort-select") {
      const sortValue = target.value;
      if (sortValue === store.state.sort) return;
      store.setState({ isLoaded: false, sort: sortValue, currentPage: 1, hasMore: true, error: null });
      syncQueryParam("sort", sortValue, "price_asc");
      lastFilters = { ...lastFilters, sort: sortValue };
      if (store.state.path === "/" && !isFetchingProducts) {
        loadProducts(1, false);
      }
      return;
    }

    if (target.id === "limit-select") {
      const limitValue = target.value;
      if (limitValue === store.state.limit) return;
      store.setState({ isLoaded: false, limit: limitValue, currentPage: 1, hasMore: true, error: null });
      syncQueryParam("limit", limitValue, "20");
      lastFilters = { ...lastFilters, limit: limitValue };
      if (store.state.path === "/" && !isFetchingProducts) {
        loadProducts(1, false);
      }
    }
  });

  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const newSearch = params.get("search") ?? "";
    const newLimit = params.get("limit") ?? "20";
    const newSort = params.get("sort") ?? "price_asc";
    const newCategory1 = params.get("category1") ?? "";
    const newCategory2 = params.get("category2") ?? "";

    store.setState({
      path: window.location.pathname,
      search: newSearch,
      limit: newLimit,
      sort: newSort,
      category1: newCategory1,
      category2: newCategory2,
      isLoaded: false,
      currentPage: 1,
      hasMore: true,
      error: null,
    });

    lastFilters = {
      search: newSearch,
      limit: newLimit,
      sort: newSort,
      category1: newCategory1,
      category2: newCategory2,
    };

    // 홈 페이지로 돌아온 경우 상품 로드
    if (window.location.pathname === "/" && !isFetchingProducts) {
      loadProducts(1, false);
    }
  });

  const performSearch = (value) => {
    const trimmed = value.trim();
    if (trimmed === store.state.search) return;
    store.setState({ isLoaded: false, search: trimmed, currentPage: 1, hasMore: true, error: null });
    syncQueryParam("search", trimmed, "");
    lastFilters = { ...lastFilters, search: trimmed };
    if (store.state.path === "/" && !isFetchingProducts) {
      loadProducts(1, false);
    }
  };

  searchKeyHandler(performSearch);

  // 무한 스크롤 처리
  let scrollObserver = null;
  const setupInfiniteScroll = () => {
    if (scrollObserver) {
      scrollObserver.disconnect();
    }

    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && store.state.path === "/" && store.state.hasMore && !store.state.isLoadingMore) {
            loadMoreProducts();
          }
        });
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    // 스크롤 트리거 요소 관찰
    const scrollTrigger = document.getElementById("scroll-trigger");
    if (scrollTrigger) {
      scrollObserver.observe(scrollTrigger);
    }
  };

  // 상태 변경 시 무한 스크롤 재설정 및 모달 스크롤 제어
  store.subscribe(async (state) => {
    // 장바구니 모달 상태에 따라 body 스크롤 제어
    if (state.isCartModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    await handleStateChange(state);
    // 렌더링 후 무한 스크롤 재설정
    setTimeout(() => {
      setupInfiniteScroll();
    }, 0);
  });

  // 초기 무한 스크롤 설정
  setTimeout(() => {
    setupInfiniteScroll();
  }, 0);

  // 초기 필터 상태 설정
  lastFilters = {
    search: store.state.search,
    category1: store.state.category1,
    category2: store.state.category2,
    sort: store.state.sort,
    limit: store.state.limit,
  };

  store.setState({ path: window.location.pathname });
};

const main = () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
