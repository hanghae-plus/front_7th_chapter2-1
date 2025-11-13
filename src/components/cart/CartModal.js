import { escapeHtml, formatCurrency } from "../../lib/utils/format.js";

export const renderCartModal = ({
  items = [],
  summary = {
    itemCount: 0,
    selectedCount: 0,
    selectedPrice: 0,
    totalPrice: 0,
    allSelected: false,
  },
} = {}) => {
  const { itemCount, selectedCount, selectedPrice, totalPrice, allSelected } = summary;

  const headerCountMarkup = itemCount
    ? `<span class="text-sm font-normal text-gray-600 ml-1">(${itemCount})</span>`
    : "";

  const selectAllSection = itemCount
    ? `
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <label class="flex items-center text-sm text-gray-700">
            <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"${allSelected ? " checked" : ""}>
            전체선택 (${itemCount}개)
          </label>
        </div>
      `
    : "";

  const itemsMarkup = items
    .map((item) => {
      const unitPrice = item.unitPrice ?? 0;
      const quantity = item.quantity ?? 0;
      const lineTotal = unitPrice * quantity;
      const safeTitle = escapeHtml(item.title ?? "");
      const brandMarkup = item.brand ? `<p class="text-xs text-gray-500 mb-1">${escapeHtml(item.brand)}</p>` : "";
      const checkedAttribute = item.isSelected ? " checked" : "";
      const unitPriceLabel = `${formatCurrency(unitPrice)}원`;
      const lineTotalLabel = `${formatCurrency(lineTotal)}원`;

      return `
          <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${item.productId}">
            <label class="flex items-center mr-3">
              <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" data-product-id="${item.productId}"${checkedAttribute}>
            </label>
            <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
              <img src="${item.image}" alt="${safeTitle}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 truncate">${safeTitle}</h4>
              ${brandMarkup}
              <p class="text-sm text-gray-600 mt-1">${unitPriceLabel}</p>
              <div class="flex items-center mt-2" aria-label="수량 조절">
                <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.productId}" aria-label="수량 감소">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <input type="number" value="${quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b border-gray-300" disabled data-product-id="${item.productId}">
                <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.productId}" aria-label="수량 증가">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="text-right ml-3">
              <p class="text-sm font-medium text-gray-900">${lineTotalLabel}</p>
              <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${item.productId}">삭제</button>
            </div>
          </div>
        `;
    })
    .join("");

  const itemsSection = itemCount
    ? `
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          ${selectAllSection}
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-4">
              ${itemsMarkup}
            </div>
          </div>
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
              <p class="text-gray-600">원하는 상품을 담아보세요!</p>
            </div>
          </div>
        </div>
      `;

  const selectedSummaryMarkup = selectedCount
    ? `
        <div class="flex justify-between items-center mb-3 text-sm">
          <span class="text-gray-600">선택한 상품 (${selectedCount}개)</span>
          <span class="font-medium">${formatCurrency(selectedPrice)}원</span>
        </div>
      `
    : "";

  const removeSelectedButtonText = selectedCount ? `선택한 상품 삭제 (${selectedCount}개)` : "선택한 상품 삭제";
  const removeSelectedButtonDisabled = selectedCount ? "" : " disabled";

  const footerMarkup = itemCount
    ? `
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          ${selectedSummaryMarkup}
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-xl font-bold text-blue-600">${formatCurrency(totalPrice)}원</span>
          </div>
          <div class="space-y-2">
            <button id="cart-modal-remove-selected-btn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm"${removeSelectedButtonDisabled}>
              ${removeSelectedButtonText}
            </button>
            <div class="flex gap-2">
              <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm">
                전체 비우기
              </button>
              <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                구매하기
              </button>
            </div>
          </div>
        </div>
      `
    : "";

  return `
      <div class="cart-modal relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden" role="dialog" aria-modal="true" aria-label="장바구니">
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니
            ${headerCountMarkup}
          </h2>
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1" aria-label="장바구니 닫기">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        ${itemsSection}
        ${footerMarkup}
      </div>
    `;
};
