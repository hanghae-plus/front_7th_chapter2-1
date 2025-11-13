import { cartState } from "../App";
import { CartIcon } from "../components/cart/CartIcon";
import { CartModal, CartModalContent, CartModalAction } from "../components/cart/CartModal";

let modalUnsubscribe = null;

/**
 * CartModal 렌더링 (내용만 업데이트)
 */
function renderCartModalContent() {
  const contentContainer = document.querySelector("[data-cart-modal-content]");
  if (!contentContainer) return;

  const { items } = cartState.getState();
  contentContainer.innerHTML = `
    ${CartModalContent({ items })}
    ${items.length > 0 ? CartModalAction({ items }) : ""}
  `;
}

/**
 * CartModal 표시
 */
export function showCartModal() {
  const modalContainer = document.getElementById("cart-modal");
  if (!modalContainer) return;

  // 모달 렌더링
  modalContainer.innerHTML = CartModal({ items: cartState.getState().items });

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

  // cartState 구독 설정 (모달이 열려있는 동안만)
  if (modalUnsubscribe) {
    modalUnsubscribe();
  }
  modalUnsubscribe = cartState.subscribe(() => {
    renderCartModalContent();
  });
}

/**
 * CartModal 숨기기
 */
export function hideCartModal() {
  const modalContainer = document.getElementById("cart-modal");
  if (!modalContainer) return;

  // 구독 해제
  if (modalUnsubscribe) {
    modalUnsubscribe();
    modalUnsubscribe = null;
  }

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
