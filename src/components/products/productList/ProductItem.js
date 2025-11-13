export const ProductItemSkeleton = /*HTML*/ `          
<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
  <div class="aspect-square bg-gray-200"></div>
  <div class="p-3">
    <div class="h-4 bg-gray-200 rounded mb-2"></div>
    <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
    <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
    <div class="h-8 bg-gray-200 rounded"></div>
  </div>
</div>`;

/**
 * 상품 정보를 담는 객체 타입 정의
 * @typedef {Object} Product
 * @property {string} title - 상품 제목
 * @property {string} link - 상품 링크 URL
 * @property {string} image - 상품 이미지 URL
 * @property {string} lprice - 최저가
 * @property {string} hprice - 최고가
 * @property {string} mallName - 쇼핑몰 이름
 * @property {string} productId - 상품 고유 ID
 * @property {string} productType - 상품 타입
 * @property {string} brand - 브랜드
 * @property {string} maker - 제조사
 * @property {string} category1 - 1차 카테고리
 * @property {string} category2 - 2차 카테고리
 * @property {string} category3 - 3차 카테고리
 * @property {string} category4 - 4차 카테고리
 */

/**
 * 개별 상품 카드 컴포넌트
 * @param {Object} props
 * @param {Product} props.product - 상품 정보 객체
 * @returns {string} 상품 카드 HTML 문자열
 */

export const ProductItem = ({ product }) => {
  /*HTML*/
  return `<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                 data-product-id="${product.productId}">
              <!-- 상품 이미지 -->
              <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
                <img src="${product.image}"
                     alt="${product.title}"
                     class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                     loading="lazy">
              </div>
              <!-- 상품 정보 -->
              <div class="p-3">
                <div class="cursor-pointer product-info mb-3">
                  <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                  ${product.title}
                  </h3>
                  <p class="text-xs text-gray-500 mb-2">${product.brand || product.maker}</p>
                  <p class="text-lg font-bold text-gray-900">
                  ${parseInt(product.lprice).toLocaleString()}원
                  </p>
                </div>
                <!-- 장바구니 버튼 -->
                <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                       hover:bg-blue-700 transition-colors add-to-cart-btn" 
                       data-product-id="${product.productId}"
                       data-product-title="${product.title}"
                       data-product-image="${product.image}"
                       data-product-lprice="${product.lprice}">
                  장바구니 담기
                </button>
              </div>
            </div>`;
};
