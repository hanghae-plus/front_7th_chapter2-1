import { Loading } from "./Loading.js";
import { store } from "../store/store.js";
import { ProductSkeleton } from "./ProductSkeleton.js";
import { ProductItem } from "./ProductItem.js";

export const ProductList = () => {
  const {
    products,
    isLoading,
    pagination: { hasNext, total },
  } = store.getState();

  return /*html*/ `
  <div class="mb-6">
    <div>
    <!-- 상품 개수 정보 -->
    ${products.length > 0 ? ProductList.TotalCount({ total }) : ""}
      <!-- 상품 그리드 -->
      ${ProductList.Container({
        children: /*html*/ `
        ${isLoading && products.length === 0 ? ProductSkeleton({ length: 4 }) : ProductItem()}
        `,
      })}
      ${isLoading || !hasNext ? Loading() : ""}
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

ProductList.TotalCount = ({ total }) => {
  return /*html*/ `
  <div class="mb-4 text-sm text-gray-600">
    총 <span class="font-medium text-gray-900">${total}개</span>의 상품
  </div>
  `;
};
