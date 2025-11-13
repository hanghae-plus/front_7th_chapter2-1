import { store } from "../store.js";
import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { MainPage } from "./pages/MainPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { updateParams } from "./router.js";
import { EventHandlers } from "./utils/eventHandlers.js";
import { parseUrlParams, buildUpdatedUrl } from "./utils/urlUtils.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

/**
 * 상품 ID를 경로에서 추출합니다
 * @param {string} path - 경로
 * @returns {string|null} 상품 ID
 */
const getProductIdFromPath = (path) => {
  const match = /^\/product\/([^/]+)$/.exec(path);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * 애플리케이션 라이프사이클 관리 클래스
 */
class AppLifecycle {
  constructor() {
    this.$root = null;
    this.isFetchingProducts = false;
    this.detailFetchId = null;
    this.detailFetchPromise = null;
    this.scrollObserver = null;
    this.eventHandlers = null;
    this.searchKeyHandler = null;
    this.unsubscribe = null;
  }

  /**
   * 애플리케이션 초기화
   */
  init() {
    this.$root = document.getElementById("root");
    if (!this.$root) {
      console.error("Root element not found");
      return;
    }

    this.setupEventHandlers();
    this.setupSearchHandler();
    this.setupPopStateHandler();
    this.setupStoreSubscription();
    this.setupInputHandlers();

    // 초기 경로 설정 (이것이 store.subscribe를 트리거하여 초기 렌더링이 시작됨)
    store.setState({ path: window.location.pathname });
  }

  /**
   * 이벤트 핸들러 설정
   */
  setupEventHandlers() {
    const navigate = (path) => {
      const currentPath = window.location.pathname + window.location.search;
      if (path === currentPath) return;
      const url = new URL(path, window.location.origin);
      history.pushState(null, "", path);

      // URL 파라미터 파싱하여 store에 반영
      const params = parseUrlParams();
      store.setState({
        path: url.pathname,
        search: params.search,
        limit: params.limit,
        sort: params.sort,
        category1: params.category1,
        category2: params.category2,
      });
    };

    this.navigate = navigate;

    this.eventHandlers = new EventHandlers({
      navigate,
      loadProducts: (page, append) => this.loadProducts(page, append),
      retryLoadProducts: () => this.retryLoadProducts(),
      isFetchingProducts: () => this.isFetchingProducts,
    });

    document.body.addEventListener("click", this.eventHandlers.handleClick);
  }

  /**
   * 검색 핸들러 설정
   */
  setupSearchHandler() {
    const performSearch = (value) => {
      const trimmed = value.trim();
      if (trimmed === store.state.search) return;

      // buildUpdatedUrl을 사용하여 기존 파라미터를 유지하면서 search만 업데이트
      const url = buildUpdatedUrl({ search: trimmed });
      this.navigate(url);

      // 로딩 상태 업데이트 및 상품 로드
      store.setState({ isLoaded: false, currentPage: 1, hasMore: true, error: null });
      if (store.state.path === "/" && !this.isFetchingProducts) {
        this.loadProducts(1, false);
      }
    };

    // 키보드 이벤트 핸들러
    this.searchKeyHandler = (event) => {
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
      performSearch(input);
    };

    document.addEventListener("keydown", this.searchKeyHandler);
  }

  /**
   * Input 핸들러 설정
   */
  setupInputHandlers() {
    document.body.addEventListener("input", (e) => {
      const target = e.target;
      if (!target || target.id !== "quantity-input") return;
      target.value = Math.min(target.value, store.state.currentProduct?.stock || 0);
    });

    document.body.addEventListener("change", (e) => {
      const target = e.target;
      if (!target) return;

      if (target.id === "sort-select") {
        const sortValue = target.value;
        if (sortValue === store.state.sort) return;
        updateParams({ sort: sortValue === "price_asc" ? "" : sortValue });
        store.setState({ isLoaded: false, sort: sortValue, currentPage: 1, hasMore: true, error: null });
        if (store.state.path === "/" && !this.isFetchingProducts) {
          this.loadProducts(1, false);
        }
        return;
      }

      if (target.id === "limit-select") {
        const limitValue = target.value;
        if (limitValue === store.state.limit) return;
        updateParams({ limit: limitValue });
        store.setState({ isLoaded: false, limit: limitValue, currentPage: 1, hasMore: true, error: null });
        if (store.state.path === "/" && !this.isFetchingProducts) {
          this.loadProducts(1, false);
        }
      }
    });
  }

  /**
   * PopState 핸들러 설정 (브라우저 뒤로가기/앞으로가기)
   */
  setupPopStateHandler() {
    window.addEventListener("popstate", () => {
      const params = parseUrlParams();

      store.setState({
        path: window.location.pathname,
        search: params.search,
        limit: params.limit,
        sort: params.sort,
        category1: params.category1,
        category2: params.category2,
        isLoaded: false,
        currentPage: 1,
        hasMore: true,
        error: null,
      });

      // 홈 페이지로 돌아온 경우 상품 로드
      if (window.location.pathname === "/" && !this.isFetchingProducts) {
        this.loadProducts(1, false);
      }
    });
  }

  /**
   * Store 구독 설정
   */
  setupStoreSubscription() {
    this.unsubscribe = store.subscribe(async (state) => {
      // 장바구니 모달 상태에 따라 body 스크롤 제어
      if (state.isCartModalOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      await this.handleStateChange(state);
      // 렌더링 후 무한 스크롤 재설정
      setTimeout(() => {
        this.setupInfiniteScroll();
      }, 0);
    });
  }

  /**
   * 제품 목록 로드
   */
  async loadProducts(page = 1, append = false) {
    if (this.isFetchingProducts) return;
    if (store.state.path !== "/") return;
    if (!append && store.state.isLoaded && !store.state.error) return;

    this.isFetchingProducts = true;
    store.setState({ error: null, isLoadingMore: append });

    try {
      // 카테고리 로드 (없는 경우만)
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
        // 무한 스크롤 시 current 파라미터를 URL에 반영
        const url = buildUpdatedUrl({ current: page.toString() });
        history.pushState(null, "", url);
      } else {
        store.setState({
          products,
          currentPage: page,
          hasMore: products.pagination.hasNext,
          isLoaded: true,
          isLoadingMore: false,
        });
        // 첫 페이지 로드 시 current 파라미터 제거 (또는 1로 설정)
        if (page === 1) {
          const url = buildUpdatedUrl({ current: "" });
          history.pushState(null, "", url);
        }
      }
    } catch (err) {
      console.error("상품 로드 실패:", err);
      store.setState({
        error: err.message || "상품을 불러오는 중 오류가 발생했습니다",
        isLoaded: false,
        isLoadingMore: false,
      });
    } finally {
      this.isFetchingProducts = false;
    }
  }

  /**
   * 재시도
   */
  retryLoadProducts() {
    store.setState({ error: null, isLoaded: false, currentPage: 1, hasMore: true });
    this.loadProducts(1, false);
  }

  /**
   * 더 많은 상품 로드 (무한 스크롤)
   */
  loadMoreProducts() {
    if (this.isFetchingProducts || !store.state.hasMore || store.state.isLoadingMore) return;
    if (store.state.path !== "/") return;

    const nextPage = store.state.currentPage + 1;
    this.loadProducts(nextPage, true);
  }

  /**
   * 상품 상세 정보 가져오기
   */
  async fetchProductDetail(productId) {
    if (!productId) return false;

    if (store.state.currentProduct?.productId === productId) {
      return true;
    }

    if (this.detailFetchPromise && this.detailFetchId === productId) {
      return this.detailFetchPromise;
    }

    this.detailFetchId = productId;
    this.detailFetchPromise = (async () => {
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
      return await this.detailFetchPromise;
    } finally {
      this.detailFetchPromise = null;
      this.detailFetchId = null;
    }
  }

  /**
   * 상태 변경 처리
   */
  async handleStateChange(state) {
    // 404 처리
    if (state.path !== "/" && !getProductIdFromPath(state.path)) {
      this.$root.innerHTML = NotFoundPage();
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    // 메인 페이지
    if (state.path === "/") {
      this.$root.innerHTML = MainPage();

      // 초기 로드가 필요한 경우
      if (!state.isLoaded && !state.error && !this.isFetchingProducts) {
        queueMicrotask(() => {
          this.loadProducts(1, false);
        });
      }
      return;
    }

    // 상품 상세 페이지
    const productId = getProductIdFromPath(state.path);
    if (productId) {
      const success = await this.fetchProductDetail(productId);
      if (success) {
        this.$root.innerHTML = ProductDetailPage();
      } else {
        this.$root.innerHTML = NotFoundPage();
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    // 404 페이지
    this.$root.innerHTML = NotFoundPage();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  /**
   * 무한 스크롤 설정
   */
  setupInfiniteScroll() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && store.state.path === "/" && store.state.hasMore && !store.state.isLoadingMore) {
            this.loadMoreProducts();
          }
        });
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    const scrollTrigger = document.getElementById("scroll-trigger");
    if (scrollTrigger) {
      this.scrollObserver.observe(scrollTrigger);
    }
  }

  /**
   * 정리 작업 (라이프사이클 종료 시)
   */
  cleanup() {
    // 이벤트 핸들러 정리
    if (this.eventHandlers) {
      this.eventHandlers.cleanup();
      document.body.removeEventListener("click", this.eventHandlers.handleClick);
    }

    // 검색 핸들러 제거
    if (this.searchKeyHandler) {
      document.removeEventListener("keydown", this.searchKeyHandler);
    }

    // IntersectionObserver 정리
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }

    // Store 구독 해제
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// 애플리케이션 인스턴스
let appInstance = null;

/**
 * 애플리케이션 시작
 */
const main = () => {
  appInstance = new AppLifecycle();
  appInstance.init();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
