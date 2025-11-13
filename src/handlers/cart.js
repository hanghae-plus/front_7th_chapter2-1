import { cartState } from "../App";
import { CartIcon } from "../components/cart/CartIcon";
import { CartModal } from "../components/cart/CartModal";

/**
 * CartModal 표시
 */
export function showCartModal() {
  const modalContainer = document.getElementById("cart-modal");
  if (!modalContainer) return;

  // 모달 렌더링
  modalContainer.innerHTML = CartModal();

  // 닫기 버튼 이벤트
  const closeBtn = document.getElementById("cart-modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideCartModal);
  }

  // 배경 클릭 시 닫기
  const overlay = document.querySelector(".cart-modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", hideCartModal);
  }

  // ESC 키로 닫기
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      hideCartModal();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);

  // body 스크롤 막기
  document.body.style.overflow = "hidden";
}

/**
 * CartModal 숨기기
 */
export function hideCartModal() {
  const modalContainer = document.getElementById("cart-modal");
  if (!modalContainer) return;

  modalContainer.innerHTML = "";

  // body 스크롤 복원
  document.body.style.overflow = "";
}

// cartState 변경 감지 및 CartIcon 업데이트
let cartStateUnsubscribe = null;

export function setupCartIconSubscription() {
  // 기존 구독 해제
  if (cartStateUnsubscribe) {
    cartStateUnsubscribe();
  }

  // cartState 변경 시 CartIcon 업데이트
  cartStateUnsubscribe = cartState.subscribe(() => {
    const container = document.querySelector("[data-cart-icon]");
    if (container) {
      container.innerHTML = CartIcon();
      // 이벤트 리스너 다시 연결
      attachCartIconClickEvent();
    }
  });
}

export function attachCartIconClickEvent() {
  const cartIcon = document.querySelector("#cart-icon-btn");
  if (cartIcon && !cartIcon.dataset.listenerAttached) {
    cartIcon.dataset.listenerAttached = "true";
    cartIcon.addEventListener("click", () => {
      showCartModal();
    });
  }
}
