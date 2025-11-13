export const SearchFirstDepth = ({ category1 = "", category2List = [] } = {}) => {
  const safeCategory1 = category1 || "";

  if (!category2List.length) {
    return `<span class="text-sm text-gray-400">하위 카테고리가 없습니다.</span>`;
  }

  return category2List
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
    .join("");
};
