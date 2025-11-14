import CartList from "./CartList.js";
import { cartStore } from "../../Store/cart.js";

export default function CartModal() {
  const { items, isCartOpen } = cartStore.getState();
  const isEmpty = items.length === 0;

  // Header content
  const renderHeader = () => {
    // const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalQuantity = items.length;
    return `
      <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
          </svg>
          장바구니
          ${totalQuantity > 0 ? `<span class="text-sm font-normal text-gray-600 ml-1">(${totalQuantity})</span>` : ""}
        </h2>
        <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
  };

  // Empty cart content
  const renderEmptyCart = () => {
    return `
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
          <p class="text-gray-600">원하는 상품을 담아보세요!</p>
        </div>
      </div>
    `;
  };

  // Footer content
  const renderFooter = () => {
    // const totalItemsCount = items.length;
    const selectedItemsCount = cartStore.getSelectedItemsCount();
    const selectedTotalPrice = cartStore.getSelectedTotalPrice();
    const totalPrice = cartStore.getTotalPrice();

    return `
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        ${
          selectedItemsCount > 0
            ? `
          <div class="flex justify-between items-center mb-3 text-sm">
            <span class="text-gray-600">선택한 상품 (${selectedItemsCount}개)</span>
            <span class="font-medium">${selectedTotalPrice.toLocaleString()}원</span>
          </div>
        `
            : ""
        }
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-bold text-gray-900">총 금액</span>
          <span class="text-xl font-bold text-blue-600">${totalPrice.toLocaleString()}원</span>
        </div>
        <div class="space-y-2">
          ${
            selectedItemsCount > 0
              ? `
            <button id="cart-modal-remove-selected-btn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md 
                     hover:bg-red-700 transition-colors text-sm">
              선택한 상품 삭제 (${selectedItemsCount}개)
            </button>
          `
              : ""
          }
          <div class="flex gap-2">
            <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                     hover:bg-gray-700 transition-colors text-sm">
              전체 비우기
            </button>
            <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                     hover:bg-blue-700 transition-colors text-sm">
              구매하기
            </button>
          </div>
        </div>
      </div>
    `;
  };

  return `
    <div class="fixed inset-0 z-50 overflow-y-auto cart-modal ${!isCartOpen ? "hidden" : ""}">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          ${renderHeader()}
          <div class="flex flex-col max-h-[calc(90vh-120px)]">
            ${isEmpty ? renderEmptyCart() : CartList(items)}
          </div>
          ${!isEmpty ? renderFooter() : ""}
        </div>
      </div>
    </div>
  `;
}
