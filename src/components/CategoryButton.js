export const Category1DepthButton = ({ category1 }) => {
  return /* HTML */ `
    <button
      data-category1=${category1}
      class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
        bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      ${category1}
    </button>
  `;
};

export const Category2DepthButton = ({ category1, category2 }) => {
  return /* HTML */ `
    <button
      data-category1=${category1}
      data-category2=${category2}
      class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      ${category2}
    </button>
  `;
};

export const Category2DepthActiveButton = ({ category1, category2 }) => {
  return /* HTML */ `
    <button
      data-category1=${category1}
      data-category2=${category2}
      class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800"
    >
      ${category2}
    </button>
  `;
};
