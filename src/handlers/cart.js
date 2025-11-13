import { cartState } from "../App";
import { CartIcon } from "../components/cart/CartIcon";
import { CartModal, CartModalContent, CartModalAction } from "../components/cart/CartModal";

let modalUnsubscribe = null;

/**
 * CartModal 내부 이벤트 핸들러 연결
 */
function attachCartModalEventHandlers() {
  // 수량 증가 버튼
  const increaseButtons = document.querySelectorAll(".quantity-increase-btn");
  increaseButtons.forEach((button) => {
    if (button.dataset.listenerAttached) return;
    button.dataset.listenerAttached = "true";
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      const currentItems = cartState.getState().items;
      cartState.setState({
        items: currentItems.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      });
    });
  });

  // 수량 감소 버튼
  const decreaseButtons = document.querySelectorAll(".quantity-decrease-btn");
  decreaseButtons.forEach((button) => {
    if (button.dataset.listenerAttached) return;
    button.dataset.listenerAttached = "true";
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      const currentItems = cartState.getState().items;
      cartState.setState({
        items: currentItems
          .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))
          .filter((item) => item.quantity > 0), // 수량이 0이면 제거
      });
    });
  });

  // 아이템 삭제 버튼
  const removeButtons = document.querySelectorAll(".cart-item-remove-btn");
  removeButtons.forEach((button) => {
    if (button.dataset.listenerAttached) return;
    button.dataset.listenerAttached = "true";
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      const currentItems = cartState.getState().items;
      cartState.setState({
        items: currentItems.filter((item) => item.productId !== productId),
      });
    });
  });

  // 선택 삭제 버튼
  const removeSelectedBtn = document.getElementById("cart-modal-remove-selected-btn");
  if (removeSelectedBtn && !removeSelectedBtn.dataset.listenerAttached) {
    removeSelectedBtn.dataset.listenerAttached = "true";
    removeSelectedBtn.addEventListener("click", () => {
      const checkedCheckboxes = document.querySelectorAll(".cart-item-checkbox:checked");
      const selectedProductIds = Array.from(checkedCheckboxes).map((checkbox) => checkbox.dataset.productId);
      const currentItems = cartState.getState().items;
      cartState.setState({
        items: currentItems.filter((item) => !selectedProductIds.includes(item.productId)),
      });
    });
  }

  // 전체 비우기 버튼
  const clearCartBtn = document.getElementById("cart-modal-clear-cart-btn");
  if (clearCartBtn && !clearCartBtn.dataset.listenerAttached) {
    clearCartBtn.dataset.listenerAttached = "true";
    clearCartBtn.addEventListener("click", () => {
      cartState.setState({ items: [] });
    });
  }

  // 구매하기 버튼
  const checkoutBtn = document.getElementById("cart-modal-checkout-btn");
  if (checkoutBtn && !checkoutBtn.dataset.listenerAttached) {
    checkoutBtn.dataset.listenerAttached = "true";
    checkoutBtn.addEventListener("click", () => {
      // TODO: 구매하기 로직 구현
      console.log("구매하기 클릭");
    });
  }

  // 전체 선택 체크박스
  const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
  if (selectAllCheckbox && !selectAllCheckbox.dataset.listenerAttached) {
    selectAllCheckbox.dataset.listenerAttached = "true";
    selectAllCheckbox.addEventListener("change", (e) => {
      const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
      itemCheckboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked;
      });
    });
  }

  // 개별 체크박스 변경 시 전체 선택 체크박스 상태 업데이트
  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
  itemCheckboxes.forEach((checkbox) => {
    if (checkbox.dataset.listenerAttached) return;
    checkbox.dataset.listenerAttached = "true";
    checkbox.addEventListener("change", () => {
      const allCheckboxes = document.querySelectorAll(".cart-item-checkbox");
      const checkedCount = document.querySelectorAll(".cart-item-checkbox:checked").length;
      const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkedCount === allCheckboxes.length && allCheckboxes.length > 0;
      }
    });
  });
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

  // innerHTML로 교체되면서 이벤트 핸들러가 제거되므로 플래그 초기화 후 다시 연결
  // 모든 이벤트 리스너 플래그 제거
  const allButtons = contentContainer.querySelectorAll("[data-listener-attached]");
  allButtons.forEach((btn) => {
    delete btn.dataset.listenerAttached;
  });
  const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
  if (selectAllCheckbox) {
    delete selectAllCheckbox.dataset.listenerAttached;
  }
  const clearCartBtn = document.getElementById("cart-modal-clear-cart-btn");
  if (clearCartBtn) {
    delete clearCartBtn.dataset.listenerAttached;
  }
  const removeSelectedBtn = document.getElementById("cart-modal-remove-selected-btn");
  if (removeSelectedBtn) {
    delete removeSelectedBtn.dataset.listenerAttached;
  }
  const checkoutBtn = document.getElementById("cart-modal-checkout-btn");
  if (checkoutBtn) {
    delete checkoutBtn.dataset.listenerAttached;
  }
  // 개별 체크박스 플래그도 초기화
  const itemCheckboxes = contentContainer.querySelectorAll(".cart-item-checkbox");
  itemCheckboxes.forEach((checkbox) => {
    delete checkbox.dataset.listenerAttached;
  });

  // 이벤트 핸들러 다시 연결
  attachCartModalEventHandlers();
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
  // 모달 내부 이벤트 핸들러 연결
  attachCartModalEventHandlers();

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
    // CartIcon도 함께 업데이트
    const container = document.querySelector("[data-cart-icon]");
    if (container) {
      container.innerHTML = CartIcon();
      // 이벤트 리스너 다시 연결
      attachCartIconClickEvent();
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
