import { store } from "../store.js";
import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { MainPage } from "./pages/MainPage.js";
import { ProductDetailPage } from "./pages/ProductDetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { updateParams } from "./router.js";
import { EventHandlers } from "./utils/eventHandlers.js";
import { parseUrlParams, buildUpdatedUrl, addBasePath } from "./utils/urlUtils.js";

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
 * Base path를 가져옵니다
 */
const getBasePath = () => {
  return import.meta.env.BASE_URL || "/";
};

/**
 * 경로에서 base path를 제거합니다
 * @param {string} pathname - 전체 경로
 * @returns {string} base path가 제거된 경로
 */
const removeBasePath = (pathname) => {
  const base = getBasePath();
  if (base === "/") return pathname;
  if (pathname.startsWith(base)) {
    const removed = pathname.slice(base.length - 1);
    return removed || "/";
  }
  return pathname;
};

/**
 * 상품 ID를 경로에서 추출합니다
 * @param {string} path - 경로 (base path 제거된 상태)
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
    this.previousPath = null; // 이전 경로 추적
    this.isPopState = false; // popstate 이벤트 여부
    // 검색/필터 관련 이전 값 추적 (중복 호출 방지)
    this.previousSearch = null;
    this.previousSort = null;
    this.previousLimit = null;
    this.previousCategory1 = null;
    this.previousCategory2 = null;
    this.pendingLoadProducts = false; // loadProducts 호출 대기 중인지 추적
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
    const initialPath = removeBasePath(window.location.pathname);
    this.previousPath = initialPath; // 초기 경로 설정
    const params = parseUrlParams();
    // 초기 검색/필터 값 설정
    this.previousSearch = params.search;
    this.previousSort = params.sort;
    this.previousLimit = params.limit;
    this.previousCategory1 = params.category1;
    this.previousCategory2 = params.category2;
    store.setState({ path: initialPath });
  }

  /**
   * 이벤트 핸들러 설정
   */
  setupEventHandlers() {
    const navigate = (path) => {
      // path가 이미 base path를 포함하고 있는지 확인
      const fullPath = path.startsWith("http") ? path : addBasePath(path);
      const currentPath = window.location.pathname + window.location.search;
      if (fullPath === currentPath) return;

      history.pushState(null, "", fullPath);

      // URL 파라미터 파싱하여 store에 반영
      const params = parseUrlParams();
      const url = new URL(fullPath, window.location.origin);
      const pathWithoutBase = removeBasePath(url.pathname);

      store.setState({
        path: pathWithoutBase,
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

      if (trimmed === store.state.search) {
        return;
      }

      // buildUpdatedUrl을 사용하여 기존 파라미터를 유지하면서 search만 업데이트
      const url = buildUpdatedUrl({ search: trimmed });

      // navigate만 호출 - store.subscribe에서 search 변경을 감지하여 loadProducts 호출
      this.navigate(url);

      // 로딩 상태만 업데이트 (loadProducts는 store.subscribe에서 호출)
      store.setState({ isLoaded: false, currentPage: 1, hasMore: true, error: null });
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
        // 상태만 업데이트 - loadProducts는 store.subscribe에서 호출
        store.setState({ isLoaded: false, sort: sortValue, currentPage: 1, hasMore: true, error: null });
        return;
      }

      if (target.id === "limit-select") {
        const limitValue = target.value;
        if (limitValue === store.state.limit) return;
        updateParams({ limit: limitValue });
        // 상태만 업데이트 - loadProducts는 store.subscribe에서 호출
        store.setState({ isLoaded: false, limit: limitValue, currentPage: 1, hasMore: true, error: null });
      }
    });
  }

  /**
   * PopState 핸들러 설정 (브라우저 뒤로가기/앞으로가기)
   */
  setupPopStateHandler() {
    window.addEventListener("popstate", () => {
      // popstate 이벤트임을 표시 (스크롤 초기화하지 않음)
      this.isPopState = true;

      const params = parseUrlParams();
      const pathWithoutBase = removeBasePath(window.location.pathname);

      // 이전 값 업데이트 (store.subscribe에서 중복 호출 방지)
      this.previousSearch = params.search;
      this.previousSort = params.sort;
      this.previousLimit = params.limit;
      this.previousCategory1 = params.category1;
      this.previousCategory2 = params.category2;

      store.setState({
        path: pathWithoutBase,
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

      // 홈 페이지로 돌아온 경우 상품 로드 (store.subscribe에서 처리되지 않으므로 직접 호출)
      if (pathWithoutBase === "/" && !this.isFetchingProducts) {
        this.loadProducts(1, false);
      }

      // popstate 처리 완료 후 플래그 리셋
      // store.subscribe가 실행된 후에 리셋하도록 queueMicrotask 사용
      queueMicrotask(() => {
        this.isPopState = false;
      });
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

      // 검색/필터 파라미터 변경 감지하여 loadProducts 호출 (중복 방지)
      // handleStateChange에서 초기 로드는 처리하므로, 여기서는 파라미터 변경만 감지
      // popstate 이벤트로 인한 변경은 popstate 핸들러에서 직접 처리하므로 건너뜀
      if (state.path === "/" && !this.isFetchingProducts && !this.pendingLoadProducts && !this.isPopState) {
        const searchChanged = this.previousSearch !== state.search;
        const sortChanged = this.previousSort !== state.sort;
        const limitChanged = this.previousLimit !== state.limit;
        const category1Changed = this.previousCategory1 !== state.category1;
        const category2Changed = this.previousCategory2 !== state.category2;

        // 파라미터가 변경되었고, 이전 값이 설정되어 있을 때만 loadProducts 호출
        // (초기 로드는 handleStateChange에서 처리)
        const shouldLoad =
          (searchChanged && this.previousSearch !== null) ||
          (sortChanged && this.previousSort !== null) ||
          (limitChanged && this.previousLimit !== null) ||
          (category1Changed && this.previousCategory1 !== null) ||
          (category2Changed && this.previousCategory2 !== null);

        // 파라미터가 변경되었으면 loadProducts 호출
        // isLoaded가 false로 설정되어 있거나, 파라미터가 변경되었으면 호출
        if (shouldLoad) {
          // 이미 fetching 중이면 pendingLoadProducts 플래그만 설정
          // loadProducts 완료 시 재시도됨
          if (this.isFetchingProducts) {
            // 파라미터 변경으로 인한 재로드이므로 isLoaded를 false로 설정
            store.setState({ isLoaded: false });
            this.pendingLoadProducts = true;
          } else {
            this.pendingLoadProducts = true;
            setTimeout(() => {
              // 파라미터 변경으로 인한 재로드이므로 isLoaded를 false로 설정
              store.setState({ isLoaded: false });
              this.loadProducts(1, false);
            }, 0);
          }
        }

        // 이전 값 업데이트 (변경 여부와 관계없이 항상 업데이트)
        this.previousSearch = state.search;
        this.previousSort = state.sort;
        this.previousLimit = state.limit;
        this.previousCategory1 = state.category1;
        this.previousCategory2 = state.category2;
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

      // pendingLoadProducts가 true면 다시 호출 (파라미터 변경으로 인한 재시도)
      if (this.pendingLoadProducts) {
        this.pendingLoadProducts = false;
        // 파라미터 변경으로 인한 재로드이므로 isLoaded를 false로 설정
        store.setState({ isLoaded: false });
        // 다음 이벤트 루프에서 실행
        setTimeout(() => {
          this.loadProducts(1, false);
        }, 0);
      }
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
    // 경로가 실제로 변경되었는지 확인
    const isPathChanged = this.previousPath !== state.path;

    // 404 처리
    if (state.path !== "/" && !getProductIdFromPath(state.path)) {
      this.$root.innerHTML = NotFoundPage();
      // 경로가 변경되었고 popstate가 아닐 때만 스크롤 초기화
      if (isPathChanged && !this.isPopState) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      this.previousPath = state.path;
      this.isPopState = false; // 플래그 리셋
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
      // 경로가 변경되었을 때만 이전 경로 업데이트 (스크롤은 초기화하지 않음)
      if (isPathChanged) {
        this.previousPath = state.path;
        this.isPopState = false; // 플래그 리셋
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
      // 경로가 변경되었고 popstate가 아닐 때만 스크롤 초기화
      if (isPathChanged && !this.isPopState) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      this.previousPath = state.path;
      this.isPopState = false; // 플래그 리셋
      return;
    }

    // 404 페이지
    this.$root.innerHTML = NotFoundPage();
    // 경로가 변경되었고 popstate가 아닐 때만 스크롤 초기화
    if (isPathChanged && !this.isPopState) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    this.previousPath = state.path;
    this.isPopState = false; // 플래그 리셋
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
