import { CartHeader } from "./CartHeader.js";
import { CartItemList } from "./CartItemList.js";
import { CartFooter } from "./CartFooter.js";

/**
 * 장바구니 모달 컴포넌트
 * @returns {string} 장바구니 모달 HTML
 */
export const CartModal = () => {
  return `
    <div class="fixed inset-0 z-50 overflow-y-auto cart-modal" style="display: none;">
      <!-- 배경 오버레이 -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
      
      <!-- 기존 코드 (div.flex부터) -->
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          ${CartHeader()}
          <div class="flex flex-col max-h-[calc(90vh-120px)]">
            ${CartItemList()}
          </div>
          ${CartFooter()}
        </div>
      </div>
    </div>
  `;
};

/**
 * 장바구니 모달 열기
 */
export const openCartModal = () => {
  const modal = document.querySelector(".cart-modal");
  if (modal) {
    modal.style.display = "block";
    document.addEventListener("keydown", handleEscapeKey);
  }
};

/**
 * 장바구니 모달 닫기
 */
export const closeCartModal = () => {
  const modal = document.querySelector(".cart-modal");
  if (modal) {
    modal.style.display = "none";
    document.removeEventListener("keydown", handleEscapeKey);
  }
};

/**
 * ESC 키 핸들러
 */
const handleEscapeKey = (e) => {
  if (e.key === "Escape") {
    closeCartModal();
  }
};
