export const SearchTwoDepth = ({ category1 = "", activeCategory2 = "", category2List = [] } = {}) => {
  const safeCategory1 = category1 || "";

  if (!category2List.length) {
    return `<span class="text-sm text-gray-400">하위 카테고리가 없습니다.</span>`;
  }

  return category2List
    .map((category2) => {
      const isActive = category2 === activeCategory2;
      const baseClass = "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors";
      const variantClass = isActive
        ? "bg-blue-100 border-blue-300 text-blue-800"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
      return `
        <button
          data-category1="${safeCategory1}"
          data-category2="${category2}"
          class="${baseClass} ${variantClass}"
        >
          ${category2}
        </button>
      `;
    })
    .join("");
};
