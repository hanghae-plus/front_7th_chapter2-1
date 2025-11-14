import { ProductDetail } from "../components/index.js";
import { PageLayout } from "./PageLayout";
import { store } from "../core/store.js";
import { router } from "../core/router.js";

let renderFn = null;
let eventHandlers = [];

export const DetailPage = {
  productId: null,

  // 페이지 초기화
  init(render, props) {
    console.log("🟢 DetailPage init 호출", props);
    renderFn = render;
    this.productId = props.productId;

    // detail state만 구독
    store.subscribe(renderFn, "detail.product");
    store.subscribe(renderFn, "detail.loading");
    store.subscribe(renderFn, "detail.error");
    store.subscribe(renderFn, "detail.relatedProducts");

    // 관련 상품 리스트 구독
    store.subscribe(renderFn, "list.products");

    this.setupEventListeners();
    this.loadProductAndRelated();
  },

  // 상품 상세, 관련 상품 로드
  async loadProductAndRelated() {
    await store.fetchProductDetail(this.productId);

    // 상품 상세 -> 관련 상품 가져오기
    const product = store.state.detail.product;
    if (product && product.category2) {
      await store.fetchProducts({
        category2: product.category2,
        limit: 20,
      });
    }
  },

  // 이벤트 위임 함수
  setupEventListeners() {
    // 관련 상품 카드 클릭 이벤트
    const relatedProductClickHandler = (e) => {
      if (e.target.closest(".related-product-card")) {
        const productId = e.target.closest(".related-product-card").dataset.productId;
        router.navigate(`/product/${productId}`);
      }
    };
    document.addEventListener("click", relatedProductClickHandler);
    eventHandlers.push({ type: "click", handler: relatedProductClickHandler });

    // 카테고리 브레드크럼 이벤트
    const breadcrumbClickHandler = (e) => {
      const breadcrumbLink = e.target.closest(".breadcrumb-link");
      if (breadcrumbLink) {
        const category1 = breadcrumbLink.dataset.category1;
        const category2 = breadcrumbLink.dataset.category2;

        if (category1 && !category2) {
          router.navigate(`/?category1=${encodeURIComponent(category1)}`);
        } else if (category1 && category2) {
          router.navigate(`/?category1=${encodeURIComponent(category1)}&category2=${encodeURIComponent(category2)}`);
        }
      }
    };
    document.addEventListener("click", breadcrumbClickHandler);
    eventHandlers.push({ type: "click", handler: breadcrumbClickHandler });
  },

  // 페이지 정리
  destroy() {
    console.log("🔴 DetailPage destroy 호출");
    if (renderFn) {
      store.unsubscribe(renderFn, "detail.product");
      store.unsubscribe(renderFn, "detail.loading");
      store.unsubscribe(renderFn, "detail.error");
      store.unsubscribe(renderFn, "detail.relatedProducts");
      store.unsubscribe(renderFn, "list.products");
      renderFn = null;

      // 이벤트 핸들러 해제
      eventHandlers.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler);
      });
      eventHandlers = [];
    }
  },

  // 렌더링
  render() {
    console.log("🎨 DetailPage render 호출");
    const { loading, product } = store.state.detail;
    const { products } = store.state.list;
    return PageLayout({
      children: `
        ${ProductDetail({ loading, product, relatedProducts: products })}
      `,
    });
  },

  // 렌더링 후 실행
  mounted() {
    console.log("✨ DetailPage mounted 호출");
  },
};
