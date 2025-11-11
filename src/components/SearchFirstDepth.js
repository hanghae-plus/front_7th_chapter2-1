export const SearchFirstDepth = ({ category1 = "", category2List = [] } = {}) => {
  const safeCategory1 = category1 || "전체";
  const options =
    category2List.length > 0
      ? category2List
          .map(
            (category2) => `
        <button
          data-category1="${safeCategory1}"
          data-category2="${category2}"
          class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          ${category2}
        </button>
      `,
          )
          .join("")
      : `<span class="text-sm text-gray-400">하위 카테고리가 없습니다.</span>`;

  return /*html*/ `
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
        <span class="text-xs text-gray-500">&gt;</span>
        <button
          data-breadcrumb="category1"
          data-category1="${safeCategory1}"
          class="text-xs hover:text-blue-800 hover:underline"
        >
          ${safeCategory1}
        </button>
      </div>
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          ${options}
        </div>
      </div>
    </div>
  `;
};
