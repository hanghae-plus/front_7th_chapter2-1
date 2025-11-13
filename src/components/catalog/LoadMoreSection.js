import { renderSkeletonCards } from "./skeleton.js";
import { renderSpinner } from "./spinner.js";

export const renderLoadMoreSection = ({ hasMore, isLoadingMore, loadMoreError }) => {
  if (loadMoreError) {
    return `
      <div class="text-center py-4 space-y-3" id="load-more-section">
        <p class="text-sm text-red-600">${loadMoreError}</p>
        <button id="load-more-retry-button" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          다시 시도
        </button>
      </div>
    `;
  }

  if (!hasMore) {
    return `<div class="text-center py-4 text-sm text-gray-500">모든 상품을 확인했습니다</div>`;
  }

  const skeletonMarkup = isLoadingMore ? `<div class="grid grid-cols-2 gap-4">${renderSkeletonCards(2)}</div>` : "";
  const indicatorMarkup = isLoadingMore
    ? renderSpinner("다음 상품을 불러오는 중...")
    : `<span class="text-sm text-gray-500">스크롤을 유지하면 다음 상품을 자동으로 불러옵니다</span>`;

  return `
    <div class="space-y-4" id="load-more-section">
      ${skeletonMarkup}
      <div class="text-center py-4">
        ${indicatorMarkup}
      </div>
      <div id="load-more-sentinel" class="w-full h-1"></div>
    </div>
  `;
};
