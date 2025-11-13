import { cartState } from "../App";
import { CartIcon } from "../components/cart/CartIcon";
import { CartModal } from "../components/cart/CartModal";
import { CartModalContent } from "../components/cart/CartModal/CartModalContent/CartModalContent";
import { CartModalAction } from "../components/cart/CartModal/CartModalAction/CartModalAction";
import { setupEventDelegation } from "./utils/eventDelegation.js";
import {
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
  removeSelectedFromCart,
  clearCart,
} from "./actions/cartActions.js";

let modalUnsubscribe = null;
let modalCleanupFunctions = [];

/**
 * CartModal 이벤트 위임 설정
 */
function setupCartModalDelegation() {
  // 기존 리스너 제거
  modalCleanupFunctions.forEach((cleanup) => cleanup());
  modalCleanupFunctions = [];

  const modal = document.querySelector(".cart-modal");
  if (!modal) return;

  // Click 이벤트 위임
  const clickHandlers = {
    // 수량 증가
    "cart-quantity-increase": (event, element) => {
      const productId = element.dataset.productId;
      if (productId) {
        increaseCartQuantity(productId);
      }
    },
    // 수량 감소
    "cart-quantity-decrease": (event, element) => {
      const productId = element.dataset.productId;
      if (productId) {
        decreaseCartQuantity(productId);
      }
    },
    // 아이템 삭제
    "cart-item-remove": (event, element) => {
      const productId = element.dataset.productId;
      if (productId) {
        removeFromCart(productId);
      }
    },
    // 선택 삭제
    "cart-remove-selected": () => {
      const checkedCheckboxes = document.querySelectorAll(".cart-item-checkbox:checked");
      const selectedProductIds = Array.from(checkedCheckboxes).map((checkbox) => checkbox.dataset.productId);
      removeSelectedFromCart(selectedProductIds);
    },
    // 전체 비우기
    "cart-clear": () => {
      clearCart();
    },
    // 구매하기
    "cart-checkout": () => {
      // TODO: 구매하기 로직 구현
      console.log("구매하기 클릭");
    },
    // 모달 닫기
    "cart-modal-close": () => {
      hideCartModal();
    },
  };

  // Change 이벤트 위임 (체크박스)
  const changeHandlers = {
    // 전체 선택 체크박스
    "cart-select-all": (event, element) => {
      const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
      itemCheckboxes.forEach((checkbox) => {
        checkbox.checked = element.checked;
      });
    },
    // 개별 체크박스
    "cart-item-checkbox": () => {
      const allCheckboxes = document.querySelectorAll(".cart-item-checkbox");
      const checkedCount = document.querySelectorAll(".cart-item-checkbox:checked").length;
      const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkedCount === allCheckboxes.length && allCheckboxes.length > 0;
      }
    },
  };

  // 이벤트 위임 설정 (모달 내부에서만)
  modalCleanupFunctions.push(setupEventDelegation("click", clickHandlers, modal));
  modalCleanupFunctions.push(setupEventDelegation("change", changeHandlers, modal));

  // 배경 클릭 시 닫기
  const overlay = modal.querySelector(".cart-modal-overlay");
  if (overlay) {
    const overlayHandler = (event) => {
      if (event.target === overlay) {
        hideCartModal();
      }
    };
    overlay.addEventListener("click", overlayHandler);
    modalCleanupFunctions.push(() => overlay.removeEventListener("click", overlayHandler));
  }

  // ESC 키로 닫기
  const escapeHandler = (event) => {
    if (event.key === "Escape") {
      hideCartModal();
    }
  };
  document.addEventListener("keydown", escapeHandler);
  modalCleanupFunctions.push(() => document.removeEventListener("keydown", escapeHandler));
}

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

  // 이벤트 위임 다시 설정 (이벤트 위임은 자동으로 새 요소에 적용됨)
  setupCartModalDelegation();
}

/**
 * CartModal 표시
 */
export function showCartModal() {
  // 이미 모달이 열려있다면 return
  if (document.querySelector(".cart-modal")) {
    return;
  }

  // 모달을 #root 안에, footer 앞에 추가
  const rootContainer = document.getElementById("root");
  if (!rootContainer) return;

  // footer를 찾아서 그 앞에 추가
  const footer = rootContainer.querySelector("footer");

  // 컴포넌트를 사용해서 모달 HTML 생성
  const modalHTML = CartModal({ items: cartState.getState().items });

  // DOM에 추가 (footer가 있으면 footer 앞에, 없으면 root에 추가)
  if (footer && footer.parentElement) {
    footer.insertAdjacentHTML("beforebegin", modalHTML);
  } else {
    rootContainer.insertAdjacentHTML("beforeend", modalHTML);
  }

  // DOM이 업데이트되도록 강제 (테스트에서 요소를 찾을 수 있도록)
  const modalElement = document.querySelector(".cart-modal");
  if (modalElement) {
    void modalElement.offsetHeight; // reflow 강제
  }

  // 모달 이벤트 설정
  setupModalEvents();
}

/**
 * 모달 이벤트 설정
 */
function setupModalEvents() {
  // 모달 이벤트 위임 설정
  setupCartModalDelegation();

  // body 스크롤 막기
  document.body.style.overflow = "hidden";

  // cartState 구독 설정 (모달이 열려있는 동안만)
  if (modalUnsubscribe) {
    modalUnsubscribe();
  }
  modalUnsubscribe = cartState.subscribe(() => {
    renderCartModalContent();
    // CartIcon도 함께 업데이트
    const container = document.querySelector("[data-cart-icon]");
    if (container) {
      container.innerHTML = CartIcon();
    }
  });
}

/**
 * CartModal 숨기기
 */
export function hideCartModal() {
  // 구독 해제
  if (modalUnsubscribe) {
    modalUnsubscribe();
    modalUnsubscribe = null;
  }

  // 이벤트 리스너 제거
  modalCleanupFunctions.forEach((cleanup) => cleanup());
  modalCleanupFunctions = [];

  // 모달 제거
  const modal = document.querySelector(".cart-modal");
  if (modal) {
    modal.remove();
  }

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
    }
  });
}
