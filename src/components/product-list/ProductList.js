import { ProductItem, ProductListSkeleton } from "@/components/product-list/index.js";
import { store } from "@/store/store.js";

export const ProductList = () => {
  const { products, isFetching } = store.state;

  return html`<div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
    ${isFetching
      ? Array(6)
          .fill(1)
          .map(() => ProductListSkeleton())
          .join("")
      : products.map((product) => `${ProductItem(product)}`).join("")}
  </div> `;
};
