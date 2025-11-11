const formatPrice = (value) => {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString()}원`;
};

const renderCartItem = ({ product = {}, quantity = 1, selected = false }) => {
  const { productId = "", title = "", image = "", lprice = 0 } = product ?? {};
  const itemPrice = (Number(lprice) || 0) * quantity;
  const safeImage = image || "https://via.placeholder.com/64x64?text=No+Image";

  return `
    <div class="flex items-center gap-3 py-3 border-b border-gray-100 cart-item" data-product-id="${productId}">
      <label class="flex items-center pt-1">
        <input
          type="checkbox"
          class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          data-product-id="${productId}"
          ${selected ? "checked" : ""}
        />
      </label>
      <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img src="${safeImage}" alt="${title}" class="w-full h-full object-cover">
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${title}</h4>
        <p class="text-sm text-gray-600 mt-1">${formatPrice(lprice)}</p>
        <div class="flex items-center mt-2">
          <button
            class="quantity-decrease-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
            data-cart-action="decrease"
            data-cart-product-id="${productId}"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <input
            type="number"
            value="${quantity}"
            min="1"
            class="quantity-input w-12 h-7 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled
            data-cart-product-id="${productId}"
          />
          <button
            class="quantity-increase-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
            data-cart-action="increase"
            data-cart-product-id="${productId}"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <p class="text-sm font-medium text-gray-900">${formatPrice(itemPrice)}</p>
        <button
          class="text-xs text-red-600 hover:text-red-700"
          data-cart-action="remove"
          data-cart-product-id="${productId}"
        >
          삭제
        </button>
      </div>
    </div>
  `;
};

export const Cart = ({ items = [], totalCount = 0, totalPrice = 0, selectedCount = 0, selectedPrice = 0 } = {}) => {
  const hasItems = Array.isArray(items) && items.length > 0;

  return /*html*/ `
    <div class="fixed inset-0 z-50 overflow-y-auto cart-modal">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
              </svg>
              장바구니
              ${hasItems ? `<span class="text-sm font-medium text-gray-500">(${totalCount}개)</span>` : ""}
            </h2>
            <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
              <span class="sr-only">장바구니 닫기</span>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          ${
            hasItems
              ? `
                <div class="flex flex-col max-h-[calc(90vh-120px)] bg-white">
                  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <label class="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        class="cart-select-all-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        ${selectedCount > 0 && selectedCount === totalCount ? "checked" : ""}
                      />
                      전체선택 (${selectedCount}/${totalCount})
                    </label>
                  </div>
                  <div class="flex-1 overflow-y-auto">
                    <div class="p-4 space-y-4 cart-items-container">
                      ${items.map(renderCartItem).join("")}
                    </div>
                  </div>
                  ${
                    selectedCount > 0
                      ? `
                        <div class="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                          <div class="flex items-center justify-between text-sm text-gray-600">
                            <span>선택한 상품</span>
                            <span class="font-medium text-gray-900">${selectedCount}개 / ${formatPrice(selectedPrice)}</span>
                          </div>
                          <div class="flex items-center justify-between text-sm text-gray-600">
                            <span>총 금액</span>
                            <span class="text-lg font-bold text-blue-600">${formatPrice(totalPrice)}</span>
                          </div>
                          <button
                            class="w-full bg-red-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-600 transition"
                            data-cart-action="remove-selected"
                          >
                            선택한 상품 삭제
                          </button>
                          <div class="flex gap-2">
                            <button
                              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 transition"
                              data-cart-action="clear"
                            >
                              전체 비우기
                            </button>
                            <button
                              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                              data-cart-action="checkout"
                            >
                              구매하기
                            </button>
                          </div>
                        </div>
                      `
                      : `
                        <div class="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                          <div class="flex items-center justify-between text-sm text-gray-600">
                            <span>총 수량</span>
                            <span class="font-medium text-gray-900">${totalCount}개</span>
                          </div>
                          <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">총 금액</span>
                            <span class="text-lg font-bold text-blue-600">${formatPrice(totalPrice)}</span>
                          </div>
                          <div class="flex gap-2 pt-1">
                            <button
                              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 transition"
                              data-cart-action="clear"
                            >
                              전체 비우기
                            </button>
                            <button
                              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                              data-cart-action="checkout"
                            >
                              구매하기
                            </button>
                          </div>
                        </div>
                      `
                  }
                </div>
              `
              : `
                <div class="flex flex-col max-h-[calc(90vh-120px)]">
                  <div class="flex-1 flex items-center justify-center p-8">
                    <div class="text-center">
                      <div class="text-gray-400 mb-4">
                        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                        </svg>
                      </div>
                      <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                      <p class="text-gray-600 text-sm">원하는 상품을 담아보세요!</p>
                    </div>
                  </div>
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
};
