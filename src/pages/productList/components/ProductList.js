export const ProductList = (loading, productList, isLoadingMore = false, hasMore = true) => {
  const products = productList;

  return `
    <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
    ${
      loading && products.length === 0
        ? CardSkeleton() + CardSkeleton() + CardSkeleton() + CardSkeleton()
        : products.map((product) => ProductCard(product)).join("")
    }
    </div>
    ${isLoadingMore ? `<div class="grid grid-cols-2 gap-4 mb-6">${CardSkeleton() + CardSkeleton()}</div>` : ""}
    ${!loading && !hasMore ? FinishMessage() : ""}
    `;
};

const ProductCard = (product) => {
  const basePath = import.meta.env.BASE_URL;
  const productUrl = `${basePath}product/${product.productId}`.replace(/\/+/g, "/");

  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                   data-product-id="${product.productId}">
                <!-- 상품 이미지 -->
                <a href="${productUrl}" data-link class="block aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
                  <img src=${product.image}
                       alt="${product.title}"
                       class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                       loading="lazy">
                </a>
                <!-- 상품 정보 -->
                <div class="p-3">
                  <a href="${productUrl}" data-link class="block cursor-pointer product-info mb-3">
                    <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      ${product.title}
                    </h3>
                    <p class="text-xs text-gray-500 mb-2"></p>
                    <p class="text-lg font-bold text-gray-900">
                      ${product.lprice}원
                    </p>
                  </a>
                  <!-- 장바구니 버튼 -->
                  <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                         hover:bg-blue-700 transition-colors add-to-cart-btn" data-product-id="${product.productId}">
                    장바구니 담기
                  </button>
                </div>
              </div>
    `;
};

const CardSkeleton = () => {
  return `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div class="aspect-square bg-gray-200"></div>
        <div class="p-3">
          <div class="h-4 bg-gray-200 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div class="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    `;
};

const FinishMessage = () => {
  return `
    <div class="text-center py-4 text-sm text-gray-500">
      모든 상품을 확인했습니다
    </div>
  `;
};
