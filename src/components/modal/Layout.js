import { CartItems } from "./CartItems";
import { carts } from "./core";
import { EmptyCart } from "./EmptyCart";
import { CartFooter } from "./Footer";

export const ModalLayout = () => {
  return html`
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden"
      >
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
              ></path>
            </svg>
            장바구니
          </h2>

          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- 컨텐츠 -->
        ${carts.length
          ? html`<div class="flex flex-col max-h-[calc(90vh-120px)]">
              ${CartItems()}
              <!-- 하단 액션 -->
              <div id="cart-modal-footer" class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                ${CartFooter()}
              </div>
            </div>`
          : html`<div class="flex flex-col max-h-[calc(90vh-120px)]">${EmptyCart()}</div>`}
      </div>
    </div>
  `;
};
