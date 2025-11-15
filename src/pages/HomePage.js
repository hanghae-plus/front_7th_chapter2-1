import { PageLayout } from "./PageLayout";
import { ProductList, SearchForm } from "../components/index.js";
import { showToast } from "../utils/Toast.js";
import { openCartModal } from "../utils/CartModal.js";
import { store } from "../core/store.js";
import { router } from "../core/router.js";

let renderFn = null;
let eventHandlers = [];

export const HomePage = {
  // URL에서 필터 상태 초기화
  initFromURL() {
    const category1 = router.getQueryParam("category1", "");
    const category2 = router.getQueryParam("category2", "");
    const search = router.getQueryParam("search", "");
    const limit = parseInt(router.getQueryParam("limit", "20"));
    const sort = router.getQueryParam("sort", "price_asc");

    if (category1) store.setState("list.category1", category1);
    if (category2) store.setState("list.category2", category2);
    if (search) store.setState("list.search", search);
    if (limit !== 20) store.setState("list.limit", limit);
    if (sort !== "price_asc") store.setState("list.sort", sort);
  },

  // Store state를 URL에 동기화
  syncToURL() {
    const { category1, category2, search, limit, sort } = store.state.list;

    router.updateQueryParams({
      category1: category1 || null,
      category2: category2 || null,
      search: search || null,
      limit: limit !== 20 ? limit : null,
      sort: sort !== "price_asc" ? sort : null,
    });
  },

  // 페이지 초기화
  init(render) {
    console.log("🟢 HomePage init 호출");
    renderFn = render;

    // 이 페이지에서 필요한 state만 구독
    store.subscribe(renderFn, "list.products");
    store.subscribe(renderFn, "list.loading");
    store.subscribe(renderFn, "list.error");
    store.subscribe(renderFn, "list.categories");
    store.subscribe(renderFn, "list.filters");
    store.subscribe(renderFn, "list.pagination");
    store.subscribe(renderFn, "list.category1");
    store.subscribe(renderFn, "list.category2");
    store.subscribe(renderFn, "list.limit");
    store.subscribe(renderFn, "list.sort");
    store.subscribe(renderFn, "list.search");
    store.subscribe(renderFn, "cart.items");

    // URL에서 필터 상태 복원
    this.initFromURL();
    this.setupEventListeners();

    // 초기 데이터 가져오기
    store.fetchProducts();
    store.fetchCategories();
  },

  // 이벤트 위임 함수
  setupEventListeners() {
    // 장바구니 아이콘 클릭 이벤트
    const cartIconHandler = (e) => {
      if (e.target.closest("#cart-icon-btn")) {
        console.log("장바구니 모달 열기");
        openCartModal();
      }
    };
    document.addEventListener("click", cartIconHandler);
    eventHandlers.push({ type: "click", handler: cartIconHandler });

    // 장바구니 담기 버튼 클릭 이벤트
    const addToCartHandler = (e) => {
      if (e.target.closest(".add-to-cart-btn")) {
        e.stopPropagation(); // 상품 카드 클릭 이벤트 전파 방지
        const productId = e.target.closest(".add-to-cart-btn").dataset.productId;
        const product = store.state.list.products.find((p) => p.productId === productId);

        if (product) {
          // store를 통해 장바구니에 추가 (수량 1개)
          store.addToCart(product, 1);
          console.log("장바구니에 상품 추가:", productId);
          showToast.success("장바구니에 추가되었습니다");
        } else {
          console.error("상품을 찾을 수 없습니다:", productId);
          showToast.error("상품 추가에 실패했습니다");
        }
      }
    };
    document.addEventListener("click", addToCartHandler);
    eventHandlers.push({ type: "click", handler: addToCartHandler });

    // 상품 카드 클릭 이벤트 (상품 이미지나 정보 클릭 시)
    const clickHandler = (e) => {
      // 장바구니 버튼이 아닌 경우에만 상세 페이지로 이동
      if (e.target.closest(".product-card") && !e.target.closest(".add-to-cart-btn")) {
        const productId = e.target.closest(".product-card").dataset.productId;
        router.navigate(`/product/${productId}`);
      }
    };
    document.addEventListener("click", clickHandler);
    eventHandlers.push({ type: "click", handler: clickHandler });

    // 전체 버튼 클릭 이벤트 - 카테고리 초기화
    const resetHandler = (e) => {
      if (e.target.closest('[data-breadcrumb="reset"]')) {
        store.setState("list.category1", "");
        store.setState("list.category2", "");
        store.fetchProducts();
        this.syncToURL();
      }
    };
    document.addEventListener("click", resetHandler);
    eventHandlers.push({ type: "click", handler: resetHandler });

    // 카테고리 브레드 크럼블 이벤트
    const breadcrumbClickHandler = (e) => {
      if (e.target.closest('[data-breadcrumb="category1"]')) {
        const category = e.target.closest('[data-breadcrumb="category1"]').dataset.category1;
        store.setState("list.category1", category);
        store.setState("list.category2", "");
        store.fetchProducts();
        this.syncToURL();
      }
    };
    document.addEventListener("click", breadcrumbClickHandler);
    eventHandlers.push({ type: "click", handler: breadcrumbClickHandler });

    // 카테고리 클릭 이벤트 (1depth)
    const categoryClickHandler = (e) => {
      if (e.target.closest(".category1-filter-btn")) {
        const category = e.target.closest(".category1-filter-btn").dataset.category1;
        store.setState("list.category1", category);
        store.setState("list.category2", ""); // 초기화
        store.fetchProducts();
        this.syncToURL();
      }
    };
    document.addEventListener("click", categoryClickHandler);
    eventHandlers.push({ type: "click", handler: categoryClickHandler });

    // 카테고리 클릭 이벤트 (2depth)
    const category2ClickHandler = (e) => {
      if (e.target.closest(".category2-filter-btn")) {
        const category = e.target.closest(".category2-filter-btn").dataset.category2;
        store.setState("list.category2", category);
        store.fetchProducts();
        this.syncToURL();
      }
    };
    document.addEventListener("click", category2ClickHandler);
    eventHandlers.push({ type: "click", handler: category2ClickHandler });

    // 개수 선택 이벤트
    const limitChangeHandler = (e) => {
      if (e.target.id === "limit-select") {
        const limit = parseInt(e.target.value, 10);
        store.setState("list.limit", limit);
        store.fetchProducts();
        this.syncToURL();
      }
    };
    document.addEventListener("change", limitChangeHandler);
    eventHandlers.push({ type: "change", handler: limitChangeHandler });

    // 정렬 선택 이벤트
    const sortChangeHandler = (e) => {
      if (e.target.id === "sort-select") {
        const sort = e.target.value;
        store.setState("list.sort", sort);
        store.fetchProducts();
        this.syncToURL();
      }
    };
    document.addEventListener("change", sortChangeHandler);
    eventHandlers.push({ type: "change", handler: sortChangeHandler });

    // 검색 이벤트 (엔터 키)
    const searchKeydownHandler = (e) => {
      if (e.target.id === "search-input" && e.key === "Enter") {
        const keyword = e.target.value.trim();
        store.setState("list.search", keyword);
        store.fetchProducts();
        this.syncToURL();
      }
    };
    document.addEventListener("keydown", searchKeydownHandler);
    eventHandlers.push({ type: "keydown", handler: searchKeydownHandler });
  },

  // 페이지 정리 (다른 페이지로 이동 시 실행)
  destroy() {
    console.log("🔴 HomePage destroy 호출");

    // store 구독 해제
    if (renderFn) {
      store.unsubscribe(renderFn, "list.products");
      store.unsubscribe(renderFn, "list.loading");
      store.unsubscribe(renderFn, "list.error");
      store.unsubscribe(renderFn, "list.categories");
      store.unsubscribe(renderFn, "list.filters");
      store.unsubscribe(renderFn, "list.pagination");
      store.unsubscribe(renderFn, "list.category1");
      store.unsubscribe(renderFn, "list.category2");
      store.unsubscribe(renderFn, "list.limit");
      store.unsubscribe(renderFn, "list.sort");
      store.unsubscribe(renderFn, "list.search");
      store.unsubscribe(renderFn, "cart.items");
      renderFn = null;

      // 이벤트 핸들러 해제
      eventHandlers.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler);
      });
      eventHandlers = [];
    }
  },

  // 렌더링 (state 변경 시마다 실행)
  render() {
    console.log("🎨 HomePage render 호출");
    const { loading, products, filters, pagination, categories, category1, category2, limit, sort, search } =
      store.state.list;
    return PageLayout({
      children: `
        ${SearchForm({ loading, filters, pagination, categories, category1, category2, limit, sort, search })}
        ${ProductList({ loading, products })}
      `,
    });
  },

  // 렌더링 후 실행 (이벤트 리스너 등록)
  mounted() {
    console.log("✨ HomePage mounted 호출");
    // 여기는 뭐해야 되니
  },
};
