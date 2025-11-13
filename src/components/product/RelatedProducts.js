import { Component } from "@/core/Component";
import { Router } from "@/core/Router";
import { getProducts } from "@/api/productApi";

const RelatedProducts = Component({
  template: ({ state }) => {
    const { loading, products } = state;

    if (loading) {
      return /* HTML */ `
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div class="p-4">
            <div class="text-center py-8 text-gray-500">로딩 중...</div>
          </div>
        </div>
      `;
    }

    if (!products || products.length === 0) {
      return /* HTML */ `
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div class="p-4">
            <div class="text-center py-8 text-gray-500">관련 상품이 없습니다.</div>
          </div>
        </div>
      `;
    }

    return /* HTML */ `
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
          <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-2 gap-3">
            ${products
              .map(
                (product) => /* HTML */ `
                  <div
                    class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer hover:bg-gray-100 transition-colors"
                    data-product-id="${product.productId}"
                  >
                    <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                      <img
                        src="${product.image}"
                        alt="${product.title}"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${product.title}</h3>
                    <p class="text-sm font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  },

  initialState: () => ({
    products: [],
    loading: true,
  }),

  setup: async (context) => {
    const { props, setState } = context;
    const { category2, currentProductId } = props;

    if (!category2) {
      setState({ loading: false, products: [] });
      return;
    }

    try {
      // category2로 상품 검색 (limit 4개)
      const { products } = await getProducts({
        category2,
        limit: 4,
      });

      // 현재 상품 제외
      const relatedProducts = products.filter((p) => p.productId !== currentProductId);

      setState({
        products: relatedProducts.slice(0, 4),
        loading: false,
      });
    } catch (error) {
      console.error("관련 상품 로드 실패:", error);
      setState({ loading: false, products: [] });
    }
  },

  setEvent: ({ addEvent }) => {
    const router = Router();

    // 관련 상품 클릭
    addEvent(".related-product-card", "click", (e) => {
      const card = e.target.closest(".related-product-card");
      if (card) {
        const productId = card.dataset.productId;
        router.push(`/product/${productId}`);
      }
    });
  },
});

export default RelatedProducts;
