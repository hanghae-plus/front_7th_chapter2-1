/**
 * 상품 아이템 컴포넌트
 * @param {Object} product - 상품 정보
 * @param {string} product.title - 상품명
 * @param {string} product.image - 상품 이미지 URL
 * @param {string} product.lprice - 최저가
 * @param {string} product.brand - 브랜드명
 * @param {string} product.productId - 상품 ID
 * @returns {string} 상품 아이템 HTML
 */
export const ProductItem = ({ title, image, lprice, brand, productId }) => {
  return /* html */ `
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
      data-product-id="${productId}"
      data-title="${title}"
      data-price="${lprice}"
      data-image="${image}"
    >
      <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img
          src="${image}"
          alt="${title}"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>
      <div class="p-3">
        <div class="cursor-pointer product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            ${title}
          </h3>
          <p class="text-xs text-gray-500 mb-2">${brand || ""}</p>
          <p class="text-lg font-bold text-gray-900">${Number(lprice).toLocaleString()}원</p>
        </div>
        <button
          class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn"
          data-product-id="${productId}"
        >
          장바구니 담기
        </button>
      </div>
    </div>
  `;
};
