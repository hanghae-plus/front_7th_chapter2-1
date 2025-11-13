import { RelatedProductItem } from '@/components';

export const RelatedProductList = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return '';
  }

  return /* HTML */ `
    <!-- 관련 상품 -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
        <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-2 gap-3 responsive-grid">
          ${products.map((product) => RelatedProductItem(product)).join('')}
        </div>
      </div>
    </div>
  `;
};
