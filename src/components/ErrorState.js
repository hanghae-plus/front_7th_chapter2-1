export const ErrorState = () => {
  return `
  <div class="flex flex-col items-center justify-center py-12 px-4">
    <div class="text-center">
      <svg class="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">상품을 불러오는 중 오류가 발생했습니다</h3>
      <p class="text-sm text-gray-600 mb-6">다시 시도해주세요.</p>
      <button id="error-retry-btn" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
        다시 시도
      </button>
    </div>
  </div>
  `;
};
