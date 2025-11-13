import { ProductItem, ProductListSkeleton, TotalCount } from "@/components/product-list/index.js";
import { store } from "@/store/store.js";

export const ProductList = () => {
  const { products, isFetching } = store.state;

  if (!products.length && isFetching) {
    return html`
      <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
        ${Array(6)
          .fill(1)
          .map(() => ProductListSkeleton())
          .join("")}
      </div>
    `;
  }

  return html`
    <!-- 상품 개수 정보 -->
    ${TotalCount()}
    <!-- 상품 목록 -->
    <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
      ${products.map((product) => `${ProductItem(product)}`).join("")}
      ${isFetching
        ? Array(2)
            .fill(1)
            .map(() => ProductListSkeleton())
            .join("")
        : ""}
    </div>
  `;
};
