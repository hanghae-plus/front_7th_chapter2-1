import ProductItem from '@/pages/home/components/ProductItem';
import ProductItemSkeleton from '@/pages/home/components/ProductItem.skeleton';
import ProductListLoading from '@/pages/home/components/ProductList.loading';

/**
 * 상품 목록 컴포넌트
 *
 * @param {{
 *  products: Array<BaseProduct>,
 *  loading: boolean
 * }} props
 * @returns {string}
 */
const ProductList = ({ products, loading }) => {
  return /* HTML */ `
    <!-- 상품 목록 -->
    <div class="mb-6">
      <div>
        ${loading
          ? /* HTML */ `
              <!-- 상품 그리드 -->
              <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                <!-- 로딩 스켈레톤 -->
                ${ProductItemSkeleton.repeat(4)}
              </div>
              ${ProductListLoading}
            `
          : /* HTML */ `
              <!-- 상품 개수 정보 -->
              <div class="mb-4 text-sm text-gray-600">
                총 <span class="font-medium text-gray-900">${products.length}개</span>의 상품
              </div>
              <!-- 상품 그리드 -->
              <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                ${products.map(ProductItem).join('')}
              </div>
            `}
      </div>
    </div>
  `;
};

export default ProductList;
