/**
 * 상품 로딩 실패 시 에러 상태 컴포넌트
 * @param {Object} props
 * @param {string} props.message - 에러 메시지
 * @returns {string} 에러 상태 HTML
 */
export const ErrorState = ({ message = "상품을 불러오는데 실패했습니다" } = {}) => {
  return `
    <div class="flex flex-col items-center justify-center py-12">
      <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-gray-600 mb-4">${message}</p>
      <button id="retry-load-products" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        다시 시도
      </button>
    </div>
  `;
};
