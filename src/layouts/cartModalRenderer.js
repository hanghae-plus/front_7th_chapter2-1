import CartModal from "../components/cart/CartModal.js";
import { cartStore } from "../Store/cart.js";
import { cartModalControl, cartProductControl } from "../utils/cartEventListeners.js";

/**
 * 장바구니 모달을 렌더링 + 관련 이벤트 리스너 부착
 */
export function renderCartModal() {
  const modalContainer = document.getElementById("modal-container");
  if (!modalContainer) {
    console.error("Modal container not found.");
    return;
  }

  modalContainer.innerHTML = CartModal();

  // 모달이 다시 렌더링될 때마다 관련 이벤트를 다시 부착
  cartModalControl(); // 모달 열고 닫기 이벤트
  cartProductControl(); // 모달 내부 상품 관련 이벤트
}

// cartStore 구독: 장바구니 상태 변경 시 모달 내용을 다시 렌더링
cartStore.subscribe(renderCartModal);
