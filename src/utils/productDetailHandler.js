/**
 * 상품 상세 페이지 이벤트 핸들러
 */

import { addToCart, updateCartIconCount } from "./cartManager.js";
import { showToast } from "./toastManager.js";
import { navigateTo } from "./navigation.js";

/**
 * 상품 상세 페이지 이벤트 핸들러 초기화
 * @param {Object} product - 상품 정보
 */
export const initProductDetailHandler = (product) => {
  // 뒤로가기 버튼
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // 수량 증가 버튼
  const quantityIncreaseBtn = document.getElementById("quantity-increase");
  const quantityDecreaseBtn = document.getElementById("quantity-decrease");
  const quantityInput = document.getElementById("quantity-input");

  if (quantityIncreaseBtn && quantityInput) {
    quantityIncreaseBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
  }

  if (quantityDecreaseBtn && quantityInput) {
    quantityDecreaseBtn.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  }

  // 수량 입력 검증
  if (quantityInput) {
    quantityInput.addEventListener("change", () => {
      const value = parseInt(quantityInput.value) || 1;
      if (value < 1) {
        quantityInput.value = 1;
      }
    });
  }

  // 장바구니 담기 버튼
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const quantity = parseInt(quantityInput?.value) || 1;
      const productData = {
        productId: product.productId,
        title: product.title,
        price: parseInt(product.lprice),
        image: product.image,
        brand: product.brand || "",
        quantity: quantity,
      };

      addToCart(productData);
      updateCartIconCount();
      showToast("장바구니에 추가되었습니다", "success");
    });
  }

  // 관련 상품 클릭
  const relatedProductCards = document.querySelectorAll(".related-product-card");
  relatedProductCards.forEach((card) => {
    card.addEventListener("click", () => {
      const productId = card.dataset.productId;
      if (productId) {
        navigateTo(`/product/${productId}`);
      }
    });
  });
};
