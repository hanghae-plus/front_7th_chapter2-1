import { ProductCard } from "./ProductCard";

export function ProductList({ products }) {
  return html` <div class="mb-6">
    <div>
      <!-- 상품 개수 정보 -->
      <div class="mb-4 text-sm text-gray-600">
        총 <span class="font-medium text-gray-900">${products.length}개</span>의 상품
      </div>
      <!-- 상품 그리드 -->
      <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
        ${products.map((product) => ProductCard({ product })).join("")}
      </div>

      <div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>
    </div>
  </div>`;
}
