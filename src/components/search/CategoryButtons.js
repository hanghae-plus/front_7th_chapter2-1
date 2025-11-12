export const CategoryButtons = ({ categories, category1, category2 }) => {
  const categoriesData = categories || {};
  const category1List = Object.keys(categoriesData);

  // 카테고리 로딩 중
  if (!categories || category1List.length === 0) {
    return /* HTML */ `
      <div class="flex flex-wrap gap-2">
        <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
      </div>
    `;
  }

  // 1depth 카테고리 표시
  if (!category1) {
    return /* HTML */ `
      <div class="flex flex-wrap gap-2">
        ${category1List
          .map(
            (cat1) => /* HTML */ `
              <button
                data-category1="${cat1}"
                class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
               bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ${cat1}
              </button>
            `,
          )
          .join('')}
      </div>
    `;
  }

  // 2depth 카테고리 표시
  return /* HTML */ `
    <div class="flex flex-wrap gap-2">
      ${Object.keys(categoriesData[category1] || {})
        .map(
          (cat2) => /* HTML */ `
            <button
              data-category1="${category1}"
              data-category2="${cat2}"
              class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
             ${category2 === cat2
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}"
            >
              ${cat2}
            </button>
          `,
        )
        .join('')}
    </div>
  `;
};
