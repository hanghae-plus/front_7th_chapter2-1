/**
 * 장바구니 모달 관리 유틸리티
 */

import { CartModal } from "../components/cart/CartModal.js";
import { clearCart, removeFromCart, updateQuantity, updateCartIconCount } from "./cartManager.js";
import { showInfoToast, showToast } from "./toastManager.js";

// localStorage 키
const CART_CHECKBOX_STATE_KEY = "cart_checkbox_state";

/**
 * 체크박스 상태를 localStorage에 저장
 */
const saveCheckboxState = () => {
  const checkedCheckboxes = document.querySelectorAll(".cart-item-checkbox:checked");
  const checkedProductIds = Array.from(checkedCheckboxes).map((cb) => cb.getAttribute("data-product-id"));
  localStorage.setItem(CART_CHECKBOX_STATE_KEY, JSON.stringify(checkedProductIds));
};

/**
 * 체크박스 상태를 localStorage에서 불러와 복원
 */
const restoreCheckboxState = () => {
  try {
    const savedState = localStorage.getItem(CART_CHECKBOX_STATE_KEY);
    if (!savedState) return;

    const checkedProductIds = JSON.parse(savedState);

    checkedProductIds.forEach((productId) => {
      const checkbox = document.querySelector(`.cart-item-checkbox[data-product-id="${productId}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });

    // 전체 선택 체크박스 상태 업데이트
    const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
    const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
    if (selectAllCheckbox && itemCheckboxes.length > 0) {
      const allChecked = Array.from(itemCheckboxes).every((cb) => cb.checked);
      selectAllCheckbox.checked = allChecked;
    }

    // 선택 삭제 버튼 업데이트
    updateDeleteSelectedButton();
  } catch (error) {
    console.error("체크박스 상태 복원 실패:", error);
  }
};

/**
 * 장바구니 모달 열기
 */
export const openCartModal = () => {
  const $root = document.getElementById("root");
  let modalElement = document.querySelector(".cart-modal");

  // 모달이 없으면 생성
  if (!modalElement) {
    const modalHTML = CartModal();
    $root.insertAdjacentHTML("beforeend", modalHTML);
    modalElement = document.querySelector(".cart-modal");

    // 이벤트 리스너 등록
    setupModalEventListeners();
  } else {
    // 이미 있으면 내용만 업데이트
    updateCartModalContent();
  }

  // 모달 표시
  if (modalElement) {
    modalElement.style.display = "block";
    // body 스크롤 방지
    document.body.style.overflow = "hidden";

    // 체크박스 상태 복원
    setTimeout(() => {
      restoreCheckboxState();
    }, 0);
  }
};

/**
 * 장바구니 모달 닫기
 */
export const closeCartModal = () => {
  const modalElement = document.querySelector(".cart-modal");
  if (modalElement) {
    modalElement.style.display = "none";
    // body 스크롤 복원
    document.body.style.overflow = "";
  }
};

/**
 * 장바구니 모달 내용 업데이트
 * @param {boolean} preserveCheckboxes - 체크박스 상태를 유지할지 여부
 */
export const updateCartModalContent = (preserveCheckboxes = false) => {
  const modalElement = document.querySelector(".cart-modal");
  if (!modalElement) return;

  // 체크박스 상태 저장
  let checkedProductIds = [];
  if (preserveCheckboxes) {
    const checkedCheckboxes = document.querySelectorAll(".cart-item-checkbox:checked");
    checkedProductIds = Array.from(checkedCheckboxes).map((cb) => cb.getAttribute("data-product-id"));
  }

  const modalHTML = CartModal();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = modalHTML;
  const newModalContent = tempDiv.firstElementChild;

  modalElement.innerHTML = newModalContent.innerHTML;

  // 이벤트 리스너 재등록
  setupModalEventListeners();

  // 체크박스 상태 복원
  if (preserveCheckboxes && checkedProductIds.length > 0) {
    checkedProductIds.forEach((productId) => {
      const checkbox = document.querySelector(`.cart-item-checkbox[data-product-id="${productId}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });

    // 전체 선택 체크박스 상태 업데이트
    const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
    const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
    if (selectAllCheckbox && itemCheckboxes.length > 0) {
      const allChecked = Array.from(itemCheckboxes).every((cb) => cb.checked);
      selectAllCheckbox.checked = allChecked;
    }

    // 선택 삭제 버튼 업데이트
    updateDeleteSelectedButton();
  }
};

/**
 * 모달 이벤트 리스너 설정
 */
const setupModalEventListeners = () => {
  // 닫기 버튼
  const closeBtn = document.getElementById("cart-modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeCartModal);
  }

  // 배경 클릭으로 닫기
  const overlay = document.querySelector(".cart-modal-overlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeCartModal();
      }
    });
  }

  // ESC 키로 닫기
  document.addEventListener("keydown", handleEscKey);

  // 전체 선택 체크박스
  const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", handleSelectAll);
  }

  // 개별 체크박스
  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
  itemCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", handleItemCheckboxChange);
  });

  // 수량 증가 버튼
  const increaseButtons = document.querySelectorAll(".quantity-increase-btn");
  increaseButtons.forEach((btn) => {
    btn.addEventListener("click", handleQuantityIncrease);
  });

  // 수량 감소 버튼
  const decreaseButtons = document.querySelectorAll(".quantity-decrease-btn");
  decreaseButtons.forEach((btn) => {
    btn.addEventListener("click", handleQuantityDecrease);
  });

  // 상품 삭제 버튼
  const removeButtons = document.querySelectorAll(".cart-item-remove-btn");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", handleRemoveItem);
  });

  // 전체 비우기 버튼
  const clearCartBtn = document.getElementById("cart-modal-clear-cart-btn");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", handleClearCart);
  }

  // 선택 삭제 버튼
  const removeSelectedBtn = document.getElementById("cart-modal-remove-selected-btn");
  if (removeSelectedBtn) {
    removeSelectedBtn.addEventListener("click", handleRemoveSelected);
  }

  // 구매하기 버튼
  const checkoutBtn = document.getElementById("cart-modal-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }
};

/**
 * ESC 키 핸들러
 */
const handleEscKey = (e) => {
  if (e.key === "Escape") {
    closeCartModal();
  }
};

/**
 * 전체 선택 핸들러
 */
const handleSelectAll = (e) => {
  const isChecked = e.target.checked;
  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
  itemCheckboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;
  });
  updateDeleteSelectedButton();
  saveCheckboxState();
};

/**
 * 개별 체크박스 변경 핸들러
 */
const handleItemCheckboxChange = () => {
  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
  const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");

  if (selectAllCheckbox) {
    const allChecked = Array.from(itemCheckboxes).every((cb) => cb.checked);
    selectAllCheckbox.checked = allChecked;
  }

  updateDeleteSelectedButton();
  saveCheckboxState();
};

/**
 * 선택한 상품 삭제 버튼 업데이트
 */
const updateDeleteSelectedButton = () => {
  const checkedCheckboxes = document.querySelectorAll(".cart-item-checkbox:checked");
  const deleteSelectedBtn = document.getElementById("cart-modal-remove-selected-btn");

  if (!deleteSelectedBtn) return;

  const selectedCount = checkedCheckboxes.length;

  if (selectedCount > 0) {
    deleteSelectedBtn.textContent = `선택한 상품 삭제 (${selectedCount}개)`;
    deleteSelectedBtn.style.display = "block";
  } else {
    deleteSelectedBtn.style.display = "none";
  }
};

/**
 * 수량 증가 핸들러
 */
const handleQuantityIncrease = (e) => {
  const productId = e.currentTarget.getAttribute("data-product-id");
  const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);

  if (input) {
    const currentValue = parseInt(input.value);
    const newValue = currentValue + 1;

    updateQuantity(productId, newValue);
    updateCartModalContent(true); // 체크박스 상태 유지
    updateCartIconCount();
  }
};

/**
 * 수량 감소 핸들러
 */
const handleQuantityDecrease = (e) => {
  const productId = e.currentTarget.getAttribute("data-product-id");
  const input = document.querySelector(`.quantity-input[data-product-id="${productId}"]`);

  if (input) {
    const currentValue = parseInt(input.value);
    if (currentValue > 1) {
      const newValue = currentValue - 1;
      updateQuantity(productId, newValue);
      updateCartModalContent(true); // 체크박스 상태 유지
      updateCartIconCount();
    }
  }
};

/**
 * 상품 삭제 핸들러
 */
const handleRemoveItem = (e) => {
  const productId = e.currentTarget.getAttribute("data-product-id");
  removeFromCart(productId);
  updateCartModalContent();
  updateCartIconCount();
  showInfoToast("상품이 삭제되었습니다");

  // 체크박스 상태 재저장 (삭제된 상품 제거)
  setTimeout(() => {
    saveCheckboxState();
  }, 0);
};

/**
 * 전체 비우기 핸들러
 */
const handleClearCart = () => {
  clearCart();
  updateCartModalContent();
  updateCartIconCount();
  showInfoToast("장바구니가 비워졌습니다");

  // 체크박스 상태 초기화
  localStorage.removeItem(CART_CHECKBOX_STATE_KEY);
};

/**
 * 선택 삭제 핸들러
 */
const handleRemoveSelected = () => {
  const checkedCheckboxes = document.querySelectorAll(".cart-item-checkbox:checked");
  const productIds = Array.from(checkedCheckboxes).map((cb) => cb.getAttribute("data-product-id"));

  if (productIds.length === 0) {
    showInfoToast("삭제할 상품을 선택해주세요");
    return;
  }

  productIds.forEach((productId) => removeFromCart(productId));
  updateCartModalContent();
  updateCartIconCount();
  showInfoToast("선택된 상품들이 삭제되었습니다");

  // 체크박스 상태 재저장 (삭제된 상품들 제거)
  setTimeout(() => {
    saveCheckboxState();
  }, 0);
};

/**
 * 구매하기 핸들러
 */
const handleCheckout = () => {
  // duration을 0으로 설정하여 사용자가 닫을 때까지 계속 표시
  showToast("구매 기능은 추후 구현 예정입니다", "info", 0);
};
