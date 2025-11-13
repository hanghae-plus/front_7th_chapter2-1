export const ProductBreadcrumb = (product) => {
  return /*html*/ `
    <nav class="mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
        ${
          product.category1
            ? /*html*/ `
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <button class="breadcrumb-link" data-category1="${product.category1}">
            ${product.category1}
          </button>
        `
            : ""
        }
        ${
          product.category2
            ? /*html*/ `
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <button class="breadcrumb-link" data-category2="${product.category2}">
            ${product.category2}
          </button>
        `
            : ""
        }
      </div>
    </nav>
  `;
};
