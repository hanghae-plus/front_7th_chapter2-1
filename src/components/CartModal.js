export const CartModal = ({ items = [], isOpen = false }) => {
  if (!isOpen) return "";

  const allSelected = items.length > 0 && items.every((item) => item.selected);
  const selectedItems = items.filter((item) => item.selected);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.lprice * item.quantity, 0);

  if (items.length === 0) {
    return `
      <div id="cart-modal-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-4 border-b flex items-center justify-between">
            <h2 class="text-lg font-bold">장바구니</h2>
            <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            <p class="text-gray-600">장바구니가 비어있습니다</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div id="cart-modal-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div class="p-4 border-b flex items-center justify-between">
          <h2 class="text-lg font-bold">장바구니 <span class="text-sm font-normal text-gray-600">(${items.length})</span></h2>
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4 border-b bg-gray-50">
          <label class="flex items-center">
            <input type="checkbox" id="cart-modal-select-all-checkbox" ${allSelected ? "checked" : ""} class="w-4 h-4 text-blue-600 rounded mr-2">
            전체선택 (${items.length}개)
          </label>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          ${items
            .map(
              (item) => `
            <div class="flex items-center py-3 border-b cart-item" data-product-id="${item.productId}">
              <label class="flex items-center mr-3">
                <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 rounded" ${item.selected ? "checked" : ""} data-product-id="${item.productId}">
              </label>
              <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden mr-3">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="${item.productId}">
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="${item.productId}">${item.title}</h4>
                <p class="text-sm text-gray-600 mt-1">${parseInt(item.lprice).toLocaleString()}원</p>
                <div class="flex items-center mt-2">
                  <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center border rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.productId}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                  </button>
                  <input type="number" value="${item.quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b" data-product-id="${item.productId}">
                  <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center border rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.productId}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="text-right ml-3">
                <p class="text-sm font-medium text-gray-900">${(parseInt(item.lprice) * item.quantity).toLocaleString()}원</p>
                <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${item.productId}">삭제</button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="p-4 border-t bg-white">
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold">총 금액</span>
            <span class="text-xl font-bold text-blue-600">${totalPrice.toLocaleString()}원</span>
          </div>
          <div class="flex gap-2">
            <button id="cart-modal-delete-selected-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">선택 삭제</button>
            <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">구매하기</button>
          </div>
        </div>
      </div>
    </div>
  `;
};
