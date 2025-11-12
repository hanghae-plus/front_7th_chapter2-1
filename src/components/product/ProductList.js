import { renderProducts } from "../../utils/productRenderer";
import { getCurrentFilters } from "../../utils/filterState";

export const ProductList = () => {
  // DOM 렌더링 후 상품 목록 로드
  setTimeout(() => {
    const currentFilters = getCurrentFilters();
    renderProducts({ params: currentFilters });
  }, 0);

  return `
    <!-- 상품 목록 -->
    <div class="mb-6">
      <div id="product-list-container">
        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          <!-- 로딩 스켈레톤 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-3">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
