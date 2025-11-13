import { navigateTo } from "./navigation.js";

/**
 * 클릭 이벤트를 감지해서 네비게이션 처리
 */
export const setupClickHandler = () => {
  document.addEventListener("click", (e) => {
    // 1. data-link 속성이 있는 요소 찾기
    const link = e.target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const path = link.getAttribute("href");
      navigateTo(path);
      return;
    }

    // [고민]: 이거 별도 처리말고 클릭 이벤트로 한번에 처리할 방법 없을까?
    const productCard = e.target.closest(".product-card, .related-product-card");
    if (productCard) {
      // 장바구니 버튼 클릭은 무시
      if (e.target.closest(".add-to-cart-btn")) {
        return;
      }

      const productId = productCard.dataset.productId;
      navigateTo(`/product/${productId}`);
      return;
    }
  });
};
