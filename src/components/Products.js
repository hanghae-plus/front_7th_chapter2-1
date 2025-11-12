const Products = () => {
  const isLoading = false;

  return (
    /* HTML */
    `
      <div class="mb-6">
        ${isLoading
          ? Skeleton()
          : /* HTML */ `
              <div>
                <!-- 상품 개수 정보 -->
                <div class="mb-4 text-sm text-gray-600">
                  총 <span class="font-medium text-gray-900">340개</span>의 상품
                </div>
                <!-- 상품 그리드 -->
                <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                  <div
                    class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                    data-product-id="86940857379"
                  >
                    <!-- 상품 이미지 -->
                    <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
                      <img
                        src="https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg"
                        alt="샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이"
                        class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    <!-- 상품 정보 -->
                    <div class="p-3">
                      <div class="cursor-pointer product-info mb-3">
                        <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이
                        </h3>
                        <p class="text-xs text-gray-500 mb-2">이지웨이건축자재</p>
                        <p class="text-lg font-bold text-gray-900">230원</p>
                      </div>
                      <!-- 장바구니 버튼 -->
                      <button
                        class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
               hover:bg-blue-700 transition-colors add-to-cart-btn"
                        data-product-id="86940857379"
                      >
                        장바구니 담기
                      </button>
                    </div>
                  </div>
                </div>

                <div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>
              </div>
            `}
      </div>
    `
  );
};

export default Products;

const Skeleton = () => {
  return (
    /* HTML */
    `
      <div>
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          ${Array.from({ length: 4 }).map(() => {
            return (
              /* HTML */
              `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div class="aspect-square bg-gray-200"></div>
                  <div class="p-3">
                    <div class="h-4 bg-gray-200 rounded mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div class="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              `
            );
          })}
        </div>
      </div>
    `
  );
};
