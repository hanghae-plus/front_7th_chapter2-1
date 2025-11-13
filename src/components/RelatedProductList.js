import { store } from "../../store";
import { RelatedProduct } from "./RelatedProduct";

export const RelatedProductList = () => {
  const relatedProducts = store.state.relatedProducts || [];

  // 관련 상품이 없으면 렌더링하지 않음
  if (!relatedProducts || relatedProducts.length === 0) {
    return "";
  }

  return `
  <!-- 관련 상품 -->
  <div class="bg-white rounded-lg shadow-sm">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
      <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
    </div>
    <div class="p-4">
      <div class="grid grid-cols-2 gap-3 responsive-grid">
      ${relatedProducts.map((product) => RelatedProduct(product)).join("")}
      </div>
    </div>
  </div>
  `;
};
