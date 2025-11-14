import { getProducts as fetchProducts } from "../../../api/productApi";

let relativeProducts = [];

// 관련 상품 데이터 로드
async function loadRelativeProducts(category2, currentProductId) {
  try {
    const response = await fetchProducts({ category2: category2 });

    // 현재 상품을 제외한 관련 상품 필터링
    relativeProducts = response.products.filter((product) => product.productId !== currentProductId);

    // 관련 상품 컨테이너 리렌더링
    const container = document.querySelector("#relative-products-container");
    if (container) {
      container.innerHTML = renderRelativeProducts();
    }
  } catch (error) {
    console.error("Failed to load relative products:", error);
    relativeProducts = [];
  }
}

// 관련 상품 리스트 렌더링
function renderRelativeProducts() {
  if (relativeProducts.length === 0) {
    return `<p class="text-sm text-gray-500 text-center py-4">관련 상품이 없습니다.</p>`;
  }

  return `
        <div class="grid grid-cols-2 gap-3 responsive-grid">
            ${relativeProducts.map((product) => RelativeProduct(product)).join("")}
        </div>
    `;
}

export const RelativeProductList = (product) => {
  const { category2, productId } = product;

  // 데이터 로드
  setTimeout(() => {
    if (category2) {
      loadRelativeProducts(category2, productId);
    }
  }, 0);

  return `
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div class="p-4" id="relative-products-container">
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 rounded-lg p-3 animate-pulse">
                <div class="aspect-square bg-gray-200 rounded-md mb-2"></div>
                <div class="h-4 bg-gray-200 rounded mb-1"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 animate-pulse">
                <div class="aspect-square bg-gray-200 rounded-md mb-2"></div>
                <div class="h-4 bg-gray-200 rounded mb-1"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
    `;
};

const RelativeProduct = (product) => {
  const basePath = import.meta.env.BASE_URL;
  const productUrl = `${basePath}product/${product.productId}`.replace(/\/+/g, "/");

  return `
       <a href="${productUrl}" data-link class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer hover:shadow-md transition-shadow" data-product-id="${product.productId}">
        <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
          <img src=${product.image} alt="${product.title}" class="w-full h-full object-cover" loading="lazy">
        </div>
        <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${product.title}</h3>
        <p class="text-sm font-bold text-blue-600">${product.lprice}원</p>
      </a>
    `;
};
