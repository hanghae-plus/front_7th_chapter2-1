export const RelatedProductItem = (product) => {
  return /*html*/ `
  <div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer" data-product-id="${product.productId}">
    <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
      <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover" loading="lazy">
    </div>
    <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${product.title}</h3>
    <p class="text-sm font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</p>
  </div>
  `;
};
