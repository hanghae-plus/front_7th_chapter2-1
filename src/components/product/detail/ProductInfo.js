/**
 * 상품의 주요 상세 정보
 * @param {object} detail - 상품 상세 정보 객체
 * @param {number} quantity - 현재 선택된 수량
 * @returns {string} - 상품 정보 HTML 문자열
 */
export default function ProductInfo(detail, quantity) {
  return `
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="p-4">
        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img src="${detail.image}" alt="${detail.title}" class="w-full h-full object-cover product-detail-image">
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-1">${detail.brand || ""}</p>
          <h1 class="text-xl font-bold text-gray-900 mb-3">${detail.title}</h1>
          <div class="flex items-center mb-3">
            <span class="ml-2 text-sm text-gray-600">${detail.rating.toFixed(1)} (${detail.reviewCount.toLocaleString()}개 리뷰)</span>
          </div>
          <div class="mb-4">
            <span class="text-2xl font-bold text-blue-600">${detail.lprice.toLocaleString()}원</span>
          </div>
          <div class="text-sm text-gray-600 mb-4">재고 ${detail.stock.toLocaleString()}개</div>
          <div class="text-sm text-gray-700 leading-relaxed mb-6">${detail.description}</div>
        </div>
      </div>
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-gray-900">수량</span>
          <div class="flex items-center">
            <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
            </button>
            <input type="number" id="quantity-input" value="${quantity}" min="1" max="${detail.stock}" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" readonly>
            <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>
        <button id="add-to-cart-btn" data-product-id="${detail.productId}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
          장바구니 담기
        </button>
      </div>
    </div>
    <div class="mb-6">
      <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors go-to-product-list">
        상품 목록으로 돌아가기
      </button>
    </div>
  `;
}
