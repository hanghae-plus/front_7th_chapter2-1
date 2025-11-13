import { ProductItem } from "./ProductItem.js";
import { ProductSkeleton } from "./ProductSkeleton.js";
import { LoadingSpinner } from "./LoadingSpinner.js";

/**
 * @typedef {Object} Product
 * @property {string} title - 상품명
 * @property {string} link - 상품 링크
 * @property {string} image - 상품 이미지 URL
 * @property {string} lprice - 최저가
 * @property {string} hprice - 최고가
 * @property {string} mallName - 쇼핑몰명
 * @property {string} productId - 상품 ID
 * @property {string} productType - 상품 타입
 * @property {string} brand - 브랜드
 * @property {string} maker - 제조사
 * @property {string} category1 - 카테고리1
 * @property {string} category2 - 카테고리2
 * @property {string} category3 - 카테고리3
 * @property {string} category4 - 카테고리4
 */

/**
 * 상품 목록 컴포넌트
 * @param {Object} props
 * @param {boolean} props.loading - 로딩 상태
 * @param {Product[]} props.products - 상품 목록
 * @param {number} props.total - 전체 상품 개수
 * @returns {string} 상품 목록 HTML
 */
export const ProductList = ({ loading, products, total }) => {
  return `
    <div class="mb-6">
      <div>
        ${
          loading
            ? `
          <!-- 상품 그리드 -->
          <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            ${ProductSkeleton.repeat(4)}
          </div>

          ${LoadingSpinner}
          `
            : `
            <!-- 상품 개수 정보 -->
            <div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">${total}개</span>의 상품
            </div>
            <!-- 상품 그리드 -->
            <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
              ${products.map(ProductItem).join("")}
            </div>
            `
        }
      </div>
    </div>
  `;
};
