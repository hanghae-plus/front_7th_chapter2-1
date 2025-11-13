import { escapeHtml, formatCurrency } from "../../lib/utils/format.js";

export const renderProductsGrid = (products = []) => {
  if (!products.length) {
    return `
      <div class="py-12 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-600">조건에 맞는 상품이 없습니다.</p>
      </div>
    `;
  }

  const cards = products
    .map((product) => {
      const { productId, title, image, brand, lprice } = product;
      const priceLabel = `${formatCurrency(lprice)}원`;
      const safeTitle = escapeHtml(title);
      const brandLabel = brand ? `<p class="text-xs text-gray-500 mb-2">${escapeHtml(brand)}</p>` : "";

      return `
        <article class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card" data-product-id="${productId}">
          <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
            <img src="${image}" alt="${safeTitle}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-200" loading="lazy">
          </div>
          <div class="p-3">
            <div class="cursor-pointer product-info mb-3">
              <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${safeTitle}</h3>
              ${brandLabel}
              <p class="text-lg font-bold text-gray-900">${priceLabel}</p>
            </div>
            <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${productId}">장바구니 담기</button>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid" data-testid="products-grid">
      ${cards}
    </div>
  `;
};
