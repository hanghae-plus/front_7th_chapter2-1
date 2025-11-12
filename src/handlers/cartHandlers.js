import {
  toggleItemSelection,
  toggleAllSelection,
  updateItemQuantity,
  removeItem,
  removeSelectedItems,
  clearCart,
  getCartItems,
} from "../utils/cartStorage.js";
import { updateCartIconCount } from "../components/common/Header.js";
import { refreshCartModal, openCartModal, closeCartModal } from "../components/cart/CartModal.js";
import { toast } from "../utils/toast.js";
import { TOAST_MESSAGES } from "../constants.js";

/**
 * 장바구니 Footer(총액 및 버튼) 업데이트
 * 체크박스 선택 시 "선택한 상품" 정보와 "선택한 상품 삭제" 버튼 표시/숨김
 */
const updateCartFooter = () => {
  const items = getCartItems();
  const selectedItems = items.filter((item) => item.selected);
  const selectedPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCount = selectedItems.length;

  // "선택한 상품" 정보 업데이트/추가/제거
  const footerContainer = document.querySelector(".cart-modal .sticky.bottom-0");
  if (footerContainer) {
    let selectedInfoElement = footerContainer.querySelector(".text-gray-600")?.parentElement;

    if (selectedCount > 0) {
      if (selectedInfoElement) {
        // 기존 요소 업데이트
        selectedInfoElement.querySelector(".text-gray-600").textContent = `선택한 상품 (${selectedCount}개)`;
        selectedInfoElement.querySelector(".font-medium").textContent = `${Number(selectedPrice).toLocaleString()}원`;
      } else {
        // 새로 생성 (총 금액 div 앞에 삽입)
        const totalPriceDiv = footerContainer.querySelector(".text-lg.font-bold");
        if (totalPriceDiv?.parentElement) {
          const selectedInfoDiv = document.createElement("div");
          selectedInfoDiv.className = "flex justify-between items-center mb-3 text-sm";
          selectedInfoDiv.innerHTML = `
            <span class="text-gray-600">선택한 상품 (${selectedCount}개)</span>
            <span class="font-medium">${Number(selectedPrice).toLocaleString()}원</span>
          `;
          footerContainer.insertBefore(selectedInfoDiv, totalPriceDiv.parentElement);
        }
      }
    } else {
      // 선택된 상품이 없으면 정보 제거
      if (selectedInfoElement) {
        selectedInfoElement.remove();
      }
    }
  }

  // "선택한 상품 삭제" 버튼 업데이트
  const buttonContainer = document.querySelector(".cart-modal .sticky.bottom-0 .space-y-2");
  if (buttonContainer) {
    const existingRemoveBtn = document.getElementById("cart-modal-remove-selected-btn");

    if (selectedCount > 0) {
      // 선택된 상품이 있으면 버튼 표시/업데이트
      if (existingRemoveBtn) {
        existingRemoveBtn.textContent = `선택한 상품 삭제 (${selectedCount}개)`;
      } else {
        // 버튼이 없으면 새로 생성
        const removeBtn = document.createElement("button");
        removeBtn.id = "cart-modal-remove-selected-btn";
        removeBtn.className =
          "w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm";
        removeBtn.textContent = `선택한 상품 삭제 (${selectedCount}개)`;
        buttonContainer.insertBefore(removeBtn, buttonContainer.firstChild);
      }
    } else {
      // 선택된 상품이 없으면 버튼 제거
      if (existingRemoveBtn) {
        existingRemoveBtn.remove();
      }
    }
  }
};

/**
 * 장바구니 모달 이벤트 핸들러 등록
 * 모달 열기/닫기 및 장바구니 아이템 조작 모두 처리
 */
export const setupCartHandlers = () => {
  document.addEventListener("click", (e) => {
    const target = e.target;

    // ===== 모달 열기/닫기 =====
    // 장바구니 아이콘 클릭 -> 모달 열기
    if (target.closest("#cart-icon-btn")) {
      openCartModal();
      return;
    }

    // 닫기 버튼 클릭 -> 모달 닫기
    if (target.closest("#cart-modal-close-btn")) {
      closeCartModal();
      return;
    }

    // 오버레이 클릭 -> 모달 닫기
    if (target.classList.contains("cart-modal-overlay")) {
      closeCartModal();
      return;
    }

    // ===== 장바구니 아이템 조작 =====

    // 개별 체크박스 클릭 - DOM만 업데이트 (성능 최적화)
    if (target.classList.contains("cart-item-checkbox")) {
      const productId = target.dataset.productId;
      const isChecked = target.checked;
      toggleItemSelection(productId, isChecked);

      // 전체 선택 체크박스 상태 동기화
      const items = getCartItems();
      const allChecked = items.length > 0 && items.every((item) => item.selected);
      const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
      }

      // 총액만 업데이트 (전체 재렌더링 안함)
      updateCartFooter();
      return;
    }

    // 전체 선택 체크박스 - DOM만 업데이트 (성능 최적화)
    if (target.id === "cart-modal-select-all-checkbox") {
      const isChecked = target.checked;
      toggleAllSelection(isChecked);

      // 모든 개별 체크박스 상태 동기화
      const checkboxes = document.querySelectorAll(".cart-item-checkbox");
      checkboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });

      // 총액만 업데이트 (전체 재렌더링 안함)
      updateCartFooter();
      return;
    }

    // 수량 증가 - 재렌더링 필요 (수량 표시 변경)
    if (target.closest(".quantity-increase-btn")) {
      const btn = target.closest(".quantity-increase-btn");
      const productId = btn.dataset.productId;
      const items = getCartItems();
      const item = items.find((item) => item.id === productId);
      if (item) {
        updateItemQuantity(productId, item.quantity + 1);
        refreshCartModal();
        updateCartIconCount();
      }
      return;
    }

    // 수량 감소 - 재렌더링 필요 (수량 표시 변경)
    if (target.closest(".quantity-decrease-btn")) {
      const btn = target.closest(".quantity-decrease-btn");
      const productId = btn.dataset.productId;
      const items = getCartItems();
      const item = items.find((item) => item.id === productId);
      if (item && item.quantity > 1) {
        updateItemQuantity(productId, item.quantity - 1);
        refreshCartModal();
        updateCartIconCount();
      }
      return;
    }

    // 아이템 삭제 - 재렌더링 필요 (DOM 구조 변경)
    if (target.closest(".cart-item-remove-btn")) {
      const btn = target.closest(".cart-item-remove-btn");
      const productId = btn.dataset.productId;
      removeItem(productId);
      refreshCartModal();
      updateCartIconCount();
      toast.info(TOAST_MESSAGES.PRODUCT_DELETE);
      return;
    }

    // 선택한 상품 삭제 - 재렌더링 필요 (DOM 구조 변경)
    if (target.id === "cart-modal-remove-selected-btn") {
      const items = getCartItems();
      const selectedCount = items.filter((item) => item.selected).length;
      if (selectedCount > 0) {
        removeSelectedItems();
        refreshCartModal();
        updateCartIconCount();
        toast.info(TOAST_MESSAGES.SELECTED_PRODUCTS_DELETE);
      }
      return;
    }

    // 전체 비우기 - 재렌더링 필요 (DOM 구조 변경)
    if (target.id === "cart-modal-clear-cart-btn") {
      clearCart();
      refreshCartModal();
      updateCartIconCount();
      toast.info(TOAST_MESSAGES.CART_CLEAR);
      return;
    }
  });
};
