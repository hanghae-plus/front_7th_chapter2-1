import { PageLayout } from "./PageLayout";
import { ProductList, SearchForm } from "../components/index.js";
import { store } from "../core/store.js";
import { router } from "../core/router.js";

let renderFn = null;
let eventHandlers = [];

export const HomePage = {
  // 페이지 초기화 (처음 진입 시 한 번 실행)
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

    this.setupEventListeners();

    // 초기 데이터 가져오기
    store.fetchProducts();
    store.fetchCategories();
  },

  // 이벤트 위임 함수
  setupEventListeners() {
    // 상품 카드 클릭 이벤트
    const clickHandler = (e) => {
      if (e.target.closest(".product-card")) {
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
      }
    };
    document.addEventListener("click", resetHandler);
    eventHandlers.push({ type: "click", handler: resetHandler });

    // 카테고리 클릭 이벤트 (1depth)
    const categoryClickHandler = (e) => {
      if (e.target.closest(".category1-filter-btn")) {
        const category = e.target.closest(".category1-filter-btn").dataset.category1;
        store.setState("list.category1", category);
        store.setState("list.category2", ""); // 초기화
      }
    };
    document.addEventListener("click", categoryClickHandler);
    eventHandlers.push({ type: "click", handler: categoryClickHandler });

    // 카테고리 클릭 이벤트 (2depth)
    const category2ClickHandler = (e) => {
      if (e.target.closest(".category2-filter-btn")) {
        const category = e.target.closest(".category2-filter-btn").dataset.category2;
        store.setState("list.category2", category);
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
      }
    };
    document.addEventListener("change", sortChangeHandler);
    eventHandlers.push({ type: "change", handler: sortChangeHandler });
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
    const { loading, products, filters, pagination, categories, category1, category2, limit, sort } = store.state.list;
    return PageLayout({
      children: `
        ${SearchForm({ loading, filters, pagination, categories, category1, category2, limit, sort })}
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
