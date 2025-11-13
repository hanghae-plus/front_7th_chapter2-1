import { carts, selectedItems } from "./core";

export const CartItems = () => {
  return html`
    <!-- 전체 선택 섹션 -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <label class="flex items-center text-sm text-gray-700">
        <input
          type="checkbox"
          checked="${selectedItems.size === carts.length ? true : false}"
          id="cart-modal-select-all-checkbox"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
        />
        전체선택 (${carts.length}개)
      </label>
    </div>
    <!-- 아이템 목록 -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        ${carts
          .map(
            ({ productId, title, image, lprice, quantity }) =>
              html` <div
                class="flex items-center py-3 border-b border-gray-100 cart-item"
                data-product-id="${productId}"
              >
                <!-- 선택 체크박스 -->
                <label class="flex items-center mr-3">
                  <input
                    type="checkbox"
                    checked="${selectedItems.has(productId) ? true : false}"
                    class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    data-product-id="${productId}"
                  />
                </label>
                <!-- 상품 이미지 -->
                <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  <img
                    src="${image}"
                    alt="${title}"
                    class="w-full h-full object-cover cursor-pointer cart-item-image"
                    data-product-id="${productId}"
                  />
                </div>
                <!-- 상품 정보 -->
                <div class="flex-1 min-w-0">
                  <h4
                    class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title"
                    data-product-id="${productId}"
                  >
                    ${title}
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">${Number(lprice).toLocaleString()}원</p>
                  <!-- 수량 조절 -->
                  <div class="flex items-center mt-2">
                    <button
                      class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
               border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                      data-product-id="${productId}"
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
                      disabled=""
                      data-product-id="${productId}"
                    />
                    <button
                      class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
               border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                      data-product-id="${productId}"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <!-- 가격 및 삭제 -->
                <div class="text-right ml-3">
                  <p class="text-sm font-medium text-gray-900">${Number(lprice * quantity).toLocaleString()}원</p>
                  <button
                    class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800"
                    data-product-id="${productId}"
                  >
                    삭제
                  </button>
                </div>
              </div>`,
          )
          .join("")}
      </div>
    </div>
  `;
};
