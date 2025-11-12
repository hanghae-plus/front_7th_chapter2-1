/**
 * 상품 카드 클릭 이벤트 핸들러
 */

import { navigateTo } from "./navigation.js";

/**
 * 상품 카드 클릭 이벤트 초기화
 * 이벤트 위임을 사용하여 동적으로 생성된 상품 카드도 처리
 */
export const initProductClickHandler = () => {
  // 이벤트 위임: products-grid에서 클릭 이벤트 캐치
  document.addEventListener("click", (e) => {
    // 장바구니 버튼 클릭은 제외
    if (e.target.closest(".add-to-cart-btn")) {
      return;
    }

    // 상품 이미지 또는 상품 정보 클릭
    const productImage = e.target.closest(".product-image");
    const productInfo = e.target.closest(".product-info");

    if (productImage || productInfo) {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        const productId = productCard.dataset.productId;
        if (productId) {
          e.preventDefault();
          navigateTo(`/product/${productId}`);
        }
      }
    }
  });
};
