import { store } from "@/store/store.js";

export const RelatedProduct = () => {
  const {
    product: { productId, category2 },
    products,
  } = store.state;

  const relatedProducts = products.filter(
    (product) => product.productId !== productId && product.category2 === category2,
  );

  return html`
    <!-- TODO: 관련 상품 -> 상품 목록에서 가져오나 ? -->
    <!-- 관련 상품 -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
        <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-2 gap-3 responsive-grid">
          ${relatedProducts
            .map(
              ({ productId, image, title, lprice }) => html`
                <div
                  class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer"
                  data-product-id="${productId}"
                >
                  <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                    <img src="${image}" alt="${title}" class="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${title}</h3>
                  <p class="text-sm font-bold text-blue-600">${lprice}원</p>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
};
