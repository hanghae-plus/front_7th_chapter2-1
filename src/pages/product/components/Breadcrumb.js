export const Breadcrumb = (product) => {
  const basePath = import.meta.env.BASE_URL;
  return `
            <nav class="mb-4">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
                <a href="${basePath}" data-link class="hover:text-blue-600 transition-colors">홈</a>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <a href="${basePath}?category1=${encodeURIComponent(product.category1)}" data-link class="hover:text-blue-600 transition-colors">
                ${product.category1}
                </a>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <a href="${basePath}?category1=${encodeURIComponent(product.category1)}&category2=${encodeURIComponent(product.category2)}" data-link class="hover:text-blue-600 transition-colors">
                ${product.category2}
                </a>
            </div>
            </nav>
        `;
};
