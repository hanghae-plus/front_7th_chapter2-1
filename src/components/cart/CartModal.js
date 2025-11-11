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
        <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          ${CartHeader()}
          <div aria-hidden="true">
            ${CartItemList()}
          </div>
          ${CartFooter()}
        </div>
      </div>
    </div>
  `;
};

/**
 * 장바구니 모달 내용 새로고침
 * LocalStorage의 최신 데이터로 모달 내용을 다시 렌더링
 */
export const refreshCartModal = () => {
  const modal = document.querySelector(".cart-modal");
  if (!modal) return;

  const contentBox = modal.querySelector(".relative.bg-white");
  if (contentBox) {
    contentBox.innerHTML = `
      ${CartHeader()}
      <div aria-hidden="true">
        ${CartItemList()}
      </div>
      ${CartFooter()}
    `;
  }
};

/**
 * 장바구니 모달 열기
 */
export const openCartModal = () => {
  // 모달 생성해서 #root에 추가
  const cartModalHTML = CartModal();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cartModalHTML;
  const root = document.querySelector("#root");
  root.appendChild(tempDiv.firstElementChild);
  const modal = document.querySelector(".cart-modal");

  modal.style.display = "block";

  // 페이지 컨텐츠를 접근성 트리에서 숨기기
  const pageContent = document.querySelector(".min-h-screen");
  if (pageContent) {
    pageContent.setAttribute("aria-hidden", "true");
  }

  // 모달의 닫기 버튼으로 포커스 이동 (스크롤 방지)
  const closeButton = modal.querySelector("#cart-modal-close-btn");
  if (closeButton) {
    closeButton.focus({ preventScroll: true });
  }

  document.addEventListener("keydown", handleEscapeKey);
};

/**
 * 장바구니 모달 닫기
 */
export const closeCartModal = () => {
  const modal = document.querySelector(".cart-modal");
  if (modal) {
    // 페이지 컨텐츠를 접근성 트리에 다시 표시
    const pageContent = document.querySelector(".min-h-screen");
    if (pageContent) {
      pageContent.removeAttribute("aria-hidden");
    }

    document.removeEventListener("keydown", handleEscapeKey);

    // DOM에서 완전히 제거
    modal.remove();
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
