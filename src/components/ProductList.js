import { Loading } from "./Loading";
import { ProductSkeleton } from "./ProductSkeleton";

export const ProductList = () => {
  // 리스트 로직
  return /*html*/ `
  <div class="mb-6">
    <div>
      <!-- 상품 그리드 -->
      ${ProductList.Container({
        children: /*html*/ `
        <!-- 로딩 스켈레톤 -->
        ${ProductSkeleton().repeat(4)}
        `,
      })}
      ${Loading()}
    </div>
  </div>
  `;
};

ProductList.Container = ({ children }) => {
  return /*html*/ `
  <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
    ${children}
  </div>
  `;
};
