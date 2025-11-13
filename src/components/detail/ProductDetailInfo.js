import { StarRating } from "./StarRating.js";
import { QuantitySelector } from "./QuantitySelector.js";

/**
 * 상품 상세 정보 컴포넌트
 * @param {Object} product - 상품 정보
 * @param {string} product.image - 상품 이미지 URL
 * @param {string} product.title - 상품명
 * @param {string} product.brand - 브랜드명
 * @param {number} product.rating - 평점
 * @param {number} product.reviewCount - 리뷰 개수
 * @param {string} product.lprice - 최저가
 * @param {number} product.stock - 재고 수량
 * @param {string} product.description - 상품 설명
 * @returns {string} 상품 상세 정보 HTML
 */
export const ProductDetailInfo = (product) => {
  return `
    <div class="bg-white rounded-lg shadow-sm mb-6"
         data-product-id="${product.productId}"
         data-title="${product.title}"
         data-price="${product.lprice}"
         data-image="${product.image}">
      <div class="p-4">
        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover product-detail-image">
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-1">${product.brand}</p>
          <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
          <div class="flex items-center mb-3">
            <div class="flex items-center">
              ${StarRating(product.rating)}
            </div>
            <span class="ml-2 text-sm text-gray-600">${product.rating}.0 (${product.reviewCount}개 리뷰)</span>
          </div>
          <div class="mb-4">
            <span class="text-2xl font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</span>
          </div>
          <div class="text-sm text-gray-600 mb-4">
            재고 ${product.stock}개
          </div>
          <div class="text-sm text-gray-700 leading-relaxed mb-6">
            ${product.description}
          </div>
        </div>
      </div>
      ${QuantitySelector({ productId: product.productId, stock: product.stock })}
    </div>
  `;
};
