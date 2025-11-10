import { BASE_PATH } from '@/constants';

const PageTitle = () => {
  const isDetailPage = location.pathname.startsWith(`${BASE_PATH}/products/`);

  return isDetailPage
    ? /* HTML */ `
        <div class="flex items-center space-x-3">
          <button
            onclick="window.history.back()"
            class="p-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
          <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
        </div>
      `
    : /* HTML */ `
        <h1 class="text-xl font-bold text-gray-900">
          <a href="${BASE_PATH}/" data-link="">쇼핑몰</a>
        </h1>
      `;
};

export default PageTitle;
