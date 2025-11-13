export const renderErrorContent = (message) => `
  <div class="flex flex-col items-center justify-center py-20">
    <div class="text-center max-w-sm">
      <div class="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19H18.93a2 2 0 001.73-3L13.73 5a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"></path>
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-900 mb-2">상품을 불러오지 못했습니다</h2>
      <p class="text-sm text-gray-600">${message ?? "일시적인 문제로 상품 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요."}</p>
      <button id="retry-button" class="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">다시 시도</button>
    </div>
  </div>
`;
