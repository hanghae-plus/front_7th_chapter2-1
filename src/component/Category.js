const Category = ({ isLoading }) => {
  return /*HTML*/ `
  <div class="space-y-2">
  <div class="flex items-center gap-2">
    <label class="text-sm text-gray-600">카테고리:</label>
    <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
  </div>
  <!-- 1depth 카테고리 -->
  ${
    isLoading
      ? /*HTML*/ `<div class="flex flex-wrap gap-2">
            <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
        </div>`
      : /*HTML*/ `<div class="flex flex-wrap gap-2">
    <button data-category1="생활/건강" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
       bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
      생활/건강
    </button>
    <button data-category1="디지털/가전" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
       bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
      디지털/가전
    </button>
  </div>`
  }
  <!-- 2depth 카테고리 -->
</div>
  `;
};

export default Category;
