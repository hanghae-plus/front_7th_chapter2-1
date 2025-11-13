import { RelatedProductItem } from "./RelatedProductItem.js";
export const RelatedProductsList = (products) => {
  return `
    <div class="p-4">
      <div class="grid grid-cols-2 gap-3 responsive-grid">
        ${products.map((product) => RelatedProductItem(product)).join("")}
      </div>
    </div>
  `;
};
