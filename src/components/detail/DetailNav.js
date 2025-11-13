const Separator = () => `
  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
  </svg>
`;

export const DetailNav = ({ product, loading = false } = {}) => {
  const crumbs = [
    `<button data-navigate="home" class="text-sm text-gray-600 hover:text-blue-600 transition-colors">홈</button>`,
  ];

  if (loading) {
    crumbs.push(`<span class="text-sm text-gray-400">로딩 중...</span>`);
  } else {
    if (product?.category1) {
      crumbs.push(
        `<button data-navigate="home-category" data-category1="${product.category1}" class="text-xs text-gray-600 hover:text-blue-600 transition-colors">${product.category1}</button>`,
      );
    }

    if (product?.category2) {
      crumbs.push(
        `<button data-navigate="home-category" data-category1="${product.category1}" data-category2="${product.category2}" class="text-xs text-gray-600 hover:text-blue-600 transition-colors">${product.category2}</button>`,
      );
    }
  }

  const content = crumbs.map((crumb, index) => (index === 0 ? crumb : `${Separator()}${crumb}`)).join("");

  return /*html*/ `
    <nav class="mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600 detail-breadcrumb">
        ${content}
      </div>
    </nav>
  `;
};
