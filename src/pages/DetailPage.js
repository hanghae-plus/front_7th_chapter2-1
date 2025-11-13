import { ProductDetail } from "../components/index.js";
import { PageLayout } from "./PageLayout";
import { store } from "../core/store.js";

let renderFn = null;

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

    // 상품 상세 정보 가져오기
    store.fetchProductDetail(this.productId);
  },

  // 페이지 정리
  destroy() {
    console.log("🔴 DetailPage destroy 호출");
    if (renderFn) {
      store.unsubscribe(renderFn, "detail.product");
      store.unsubscribe(renderFn, "detail.loading");
      store.unsubscribe(renderFn, "detail.error");
      store.unsubscribe(renderFn, "detail.relatedProducts");
      renderFn = null;
    }
  },

  // 렌더링
  render() {
    console.log("🎨 DetailPage render 호출");
    const { loading, product } = store.state.detail;
    //console.log("product", product);
    return PageLayout({
      children: `
        ${ProductDetail({ loading, product })}
      `,
    });
  },

  // 렌더링 후 실행
  mounted() {
    console.log("✨ DetailPage mounted 호출");

    // // 장바구니 담기 버튼
    // const addToCartBtn = document.querySelector("#add-to-cart-btn");
    // if (addToCartBtn) {
    //   addToCartBtn.addEventListener("click", () => {
    //     console.log("장바구니에 추가!");
    //     alert("장바구니에 추가되었습니다!");
    //   });
    // }

    // // 수량 증가/감소 버튼
    // const decreaseBtn = document.querySelector("#quantity-decrease");
    // const increaseBtn = document.querySelector("#quantity-increase");
    // const quantityInput = document.querySelector("#quantity-input");

    // if (decreaseBtn && quantityInput) {
    //   decreaseBtn.addEventListener("click", () => {
    //     const current = parseInt(quantityInput.value);
    //     if (current > 1) {
    //       quantityInput.value = current - 1;
    //     }
    //   });
    // }

    // if (increaseBtn && quantityInput) {
    //   increaseBtn.addEventListener("click", () => {
    //     const current = parseInt(quantityInput.value);
    //     const max = parseInt(quantityInput.max);
    //     if (current < max) {
    //       quantityInput.value = current + 1;
    //     }
    //   });
    // }
  },
};
