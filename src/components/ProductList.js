import { Loading } from "./Loading.js";
import { store } from "../store/store.js";
import { ProductSkeleton } from "./ProductSkeleton.js";
import { ProductItem } from "./ProductItem.js";

export const ProductList = () => {
  const {
    products,
    isLoading,
    pagination: { hasNext },
  } = store.getState();

  return /*html*/ `
  <div class="mb-6">
    <div>
      <!-- 상품 그리드 -->
      ${isLoading || !hasNext ? Loading() : ""}
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
