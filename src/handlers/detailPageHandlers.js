import { setupEventDelegation } from "./utils/eventDelegation.js";
import { handleDetailPageAddToCart, handleQuantityIncrease, handleQuantityDecrease } from "./actions/productActions.js";
import { navigateToProduct } from "./actions/navigationActions.js";

let cleanupFunctions = [];

/**
 * DetailPage 이벤트 위임 설정
 */
export function setupDetailPageDelegation() {
  // 기존 리스너 제거
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions = [];

  // Click 이벤트 위임
  const clickHandlers = {
    // 수량 증가
    "quantity-increase": () => {
      handleQuantityIncrease();
    },
    // 수량 감소
    "quantity-decrease": () => {
      handleQuantityDecrease();
    },
    // 장바구니 추가 (상세 페이지)
    "add-to-cart-detail": (_, element) => {
      handleDetailPageAddToCart(element);
    },
    // 관련 상품 클릭
    "related-product": (_, element) => {
      const productId = element.dataset.productId;
      if (productId) {
        navigateToProduct(productId);
      }
    },
  };

  // 이벤트 위임 설정
  cleanupFunctions.push(setupEventDelegation("click", clickHandlers));
}

/**
 * DetailPage 이벤트 위임 제거
 */
export function cleanupDetailPageDelegation() {
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions = [];
}
