import { cartStore } from "../Store/cart.js";
import { router } from "../Router/router.js"; // router를 올바르게 임포트

function setupCartEventListeners() {
  const cartModal = document.querySelector(".cart-modal");
  const cartIconBtn = document.getElementById("cart-icon-btn");
  const cartModalCloseBtn = document.getElementById("cart-modal-close-btn");
  const cartModalOverlay = document.querySelector(".cart-modal-overlay");

  // 장바구니 모달 열기
  if (cartIconBtn) {
    cartIconBtn.addEventListener("click", () => {
      if (cartModal) {
        cartModal.classList.remove("hidden");
      }
    });
  }

  // 장바구니 모달 닫기
  const closeCartModal = () => {
    if (cartModal) {
      cartModal.classList.add("hidden");
    }
  };

  if (cartModalCloseBtn) {
    cartModalCloseBtn.addEventListener("click", closeCartModal);
  }
  if (cartModalOverlay) {
    cartModalOverlay.addEventListener("click", closeCartModal);
  }

  // Escape 키로 모달 닫기
  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartModal && !cartModal.classList.contains("hidden")) {
      closeCartModal();
    }
  });

  // 모달 내 장바구니 상호작용을 위한 이벤트 위임
  if (cartModal) {
    cartModal.addEventListener("click", (e) => {
      // 상품 제거
      const removeBtn = e.target.closest(".cart-item-remove-btn");
      if (removeBtn) {
        const productId = removeBtn.dataset.productId;
        cartStore.removeItem(productId);
        return;
      }

      // 수량 증가
      const increaseBtn = e.target.closest(".quantity-increase-btn");
      if (increaseBtn) {
        const productId = increaseBtn.dataset.productId;
        const item = cartStore.getState().items.find((item) => item.id === productId);
        if (item) {
          cartStore.updateItemQuantity(productId, item.quantity + 1);
        }
        return;
      }

      // 수량 감소
      const decreaseBtn = e.target.closest(".quantity-decrease-btn");
      if (decreaseBtn) {
        const productId = decreaseBtn.dataset.productId;
        const item = cartStore.getState().items.find((item) => item.id === productId);
        if (item && item.quantity > 1) {
          cartStore.updateItemQuantity(productId, item.quantity - 1);
        }
        return;
      }

      // 장바구니 비우기
      const clearCartBtn = e.target.closest("#cart-modal-clear-cart-btn");
      if (clearCartBtn) {
        cartStore.clearCart();
        return;
      }

      // 선택된 상품 제거
      const removeSelectedBtn = e.target.closest("#cart-modal-remove-selected-btn");
      if (removeSelectedBtn) {
        cartStore.removeSelectedItems();
        return;
      }
    });

    cartModal.addEventListener("change", (e) => {
      // 개별 상품 체크박스 토글
      const itemCheckbox = e.target.closest(".cart-item-checkbox");
      if (itemCheckbox) {
        const productId = itemCheckbox.dataset.productId;
        cartStore.cartItemChecked(productId); // 메서드 이름 변경
        return;
      }

      // 전체 선택 체크박스 토글
      const selectAllCheckbox = e.target.closest("#cart-modal-select-all-checkbox");
      if (selectAllCheckbox) {
        cartStore.cartAllItemsChecked(selectAllCheckbox.checked); // 메서드 이름 변경
        return;
      }
    });
  }

  // 장바구니 스토어 변경 구독하여 모달 내용 다시 렌더링
  cartStore.subscribe(() => {
    // 상태 변경을 반영하기 위해 전체 모달 내용을 다시 렌더링
    router.renderCurrentPage();
  });
}

export default setupCartEventListeners;
