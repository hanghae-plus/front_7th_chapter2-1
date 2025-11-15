import { ProductDetail } from "../components/index.js";
import { openCartModal } from "../utils/CartModal.js";
import { showToast } from "../utils/Toast.js";
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

    store.subscribe(renderFn, "list.products");
    store.subscribe(renderFn, "cart.items");

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
      if (e.target.closest("#add-to-cart-btn")) {
        const quantity = parseInt(document.getElementById("quantity-input").value);
        const product = store.state.detail.product;

        if (product) {
          // 장바구니에 추가
          store.addToCart(product, quantity);
          showToast.success(`장바구니에 추가되었습니다`);
        }
      }
    };
    document.addEventListener("click", addToCartHandler);
    eventHandlers.push({ type: "click", handler: addToCartHandler });

    // 수량 증가 & 감소 클릭 이벤트
    const quantityChangeHandler = (e) => {
      if (e.target.closest("#quantity-decrease") || e.target.closest("#quantity-increase")) {
        const quantityInput = document.getElementById("quantity-input");

        if (!quantityInput) return;

        let quantity = parseInt(quantityInput.value) || 1;

        if (e.target.closest("#quantity-decrease")) {
          quantity--;
        } else if (e.target.closest("#quantity-increase")) {
          quantity++;
        }
        quantityInput.value = Math.max(1, Math.min(quantity, 107));
      }
    };
    document.addEventListener("click", quantityChangeHandler);
    eventHandlers.push({ type: "click", handler: quantityChangeHandler });

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
      store.unsubscribe(renderFn, "cart.items");
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
