const Skeleton = /* HTML */ `
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

const Loading = /* HTML */ `
  <div class="text-center py-4">
    <div class="inline-flex items-center">
      <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
    </div>
  </div>
`;

const ProductItem = ({ title, image, lprice, productId, brand }) => {
  // 장바구니에 추가할 상품 데이터
  const productData = JSON.stringify({
    id: productId,
    title,
    image,
    lprice,
    brand,
  });

  return /* HTML */ `
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
      data-product-id="${productId}"
    >
      <!-- 상품 이미지 -->
      <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img
          src="${image}"
          alt="${title}"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>
      <!-- 상품 정보 -->
      <div class="p-3">
        <div class="cursor-pointer product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${title}</h3>
          <p class="text-xs text-gray-500 mb-2">${brand || ""}</p>
          <p class="text-lg font-bold text-gray-900">${Number(lprice).toLocaleString()}원</p>
        </div>
        <!-- 장바구니 버튼 -->
        <button
          class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                    hover:bg-blue-700 transition-colors add-to-cart-btn"
          data-product="${productData.replace(/"/g, "&quot;")}"
        >
          장바구니 담기
        </button>
      </div>
    </div>
  `;
};

const ErrorState = () => /* HTML */ `
  <div class="text-center my-4 py-20 shadow-md p-6 bg-white rounded-lg">
    <svg class="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      ></path>
    </svg>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">상품을 불러올 수 없습니다</h3>
    <p class="text-sm text-gray-600 mb-4">네트워크 연결을 확인해주세요</p>
    <button
      id="retry-btn"
      class="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      다시 시도
    </button>
  </div>
`;

export const ProductList = ({ products, loading, pagination = {}, error }) => {
  const totalCount = pagination.total || products.length;
  const isLoadingMore = pagination.isLoadingMore || false;
  const hasNext = pagination.hasNext !== undefined ? pagination.hasNext : true;

  return /* HTML */ `
    <div class="mb-6">
      <div>
        ${error
          ? ErrorState()
          : loading
            ? /* HTML */ `
                <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">${Skeleton.repeat(4)}</div>
                ${Loading}
              `
            : /* HTML */ `
                <div class="mb-4 text-sm text-gray-600">
                  총 <span class="font-medium text-gray-900">${totalCount}개</span>의 상품
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">${products.map(ProductItem).join("")}</div>
                ${isLoadingMore
                  ? /* HTML */ `
                      <div class="grid grid-cols-2 gap-4 mb-4">${Skeleton.repeat(4)}</div>
                      ${Loading}
                    `
                  : !hasNext && products.length > 0
                    ? /* HTML */ `<div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>`
                    : ""}
              `}
      </div>
    </div>
  `;
};
