/**
 * 컴포넌트 관련 유틸리티 함수
 */

/**
 * 별점 아이콘을 렌더링합니다
 * @param {number} rating - 평점 (0-5)
 * @param {number} maxRating - 최대 평점 (기본값: 5)
 * @returns {string} 별점 HTML
 */
export const renderStarRating = (rating, maxRating = 5) => {
  const filledStar = `
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
  `;

  const emptyStar = `
    <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
  `;

  const filledCount = Math.floor(rating);
  const emptyCount = maxRating - filledCount;

  return filledStar.repeat(filledCount) + emptyStar.repeat(emptyCount);
};

/**
 * 카테고리 버튼의 클래스를 생성합니다
 * @param {boolean} isSelected - 선택 여부
 * @param {string} buttonType - 버튼 타입 ('category1' 또는 'category2')
 * @returns {string} 클래스 문자열
 */
export const getCategoryButtonClass = (isSelected, buttonType = "category1") => {
  const baseClass = `${buttonType}-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors`;
  if (isSelected) {
    return `${baseClass} bg-blue-600 text-white border-blue-600`;
  }
  return `${baseClass} bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
};
