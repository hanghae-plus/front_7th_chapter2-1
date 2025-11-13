import { cartStore } from "../Store/cart.js";

/**
 * 장바구니 모달을 열고 닫는 이벤트 리스너 추가용 함수
 * 헤더와 모달이 다시 렌더링될 때마다 호출돼야 함
 */
export function cartModalControl() {
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

  // 장바구니 모달 닫기 함수
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

  // Escape 키로 모달 닫기 (이 리스너는 body에 한 번만 부착해도 되지만, 편의상 여기서 함께 관리)
  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartModal && !cartModal.classList.contains("hidden")) {
      closeCartModal();
    }
  });
}

/**
 * 장바구니 모달 내부 상품 관련 이벤트 리스너 부착
 * 모달 내용이 다시 렌더링될 때마다 호출되어야 합니다.
 */
// TODO: 각 내부기능 함수 별 로직상 cart스토어의 #setState로직이 있어서 notify로직 실행됨(리렌더링 시작됨 - 모달창 강제로 닫아짐))
// --> '닫기' 이벤트 or 새로고침할 때 내부 정보들을 로컬스토리지에 저장시키고,
// 모달창이 렌더링이 될 때마다 롴러스토리 정보를 불러오도록 프로세스 수정해야할 듯
export function cartProductControl() {
  const cartModal = document.querySelector(".cart-modal");
  if (!cartModal) return;

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
      cartStore.cartItemChecked(productId);
      return;
    }

    // 전체 선택 체크박스 토글
    const selectAllCheckbox = e.target.closest("#cart-modal-select-all-checkbox");
    if (selectAllCheckbox) {
      cartStore.cartAllItemsChecked(selectAllCheckbox.checked);
      return;
    }
  });
}
