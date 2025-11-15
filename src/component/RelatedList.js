import RelatedProduct from "./RelatedProduct";

const RelatedList = ({ relatedProducts }) => {
  return /*html*/ `
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

export default RelatedList;
