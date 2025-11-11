const Separator = () => `
  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
  </svg>
`;

export const DetailNav = () => {
  const crumbs = [
    `<button data-navigate="home" class="text-sm text-gray-600 hover:text-blue-600 transition-colors">홈</button>`,
  ];

  const content = crumbs.map((crumb, index) => (index === 0 ? crumb : `${Separator()}${crumb}`)).join("");

  return /*html*/ `
    <nav class="mb-4">
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        ${content}
      </div>
    </nav>
  `;
};
