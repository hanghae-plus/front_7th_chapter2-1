export const Category = ({ categories }) => {
  const category1List = Object.keys(categories);

  return /*html*/ `
<!-- 필터 옵션 -->
<div class="space-y-3">
  <!-- 카테고리 필터 -->
  <div class="space-y-2">
    <div id="breadcrumb-container" class="flex items-center gap-2">
      <label class="text-sm text-gray-600">카테고리:</label>
      <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
    </div>

    <!-- 1depth 카테고리 -->
    <div id="category1-container" class="flex flex-wrap gap-2">
      ${category1List
        .map(
          (cat1Name) => `
      <button data-category1="${cat1Name}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                   bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
        ${cat1Name}
      </button>`,
        )
        .join("")}
    </div>

    <!-- 2depth 카테고리 (초기에는 모두 숨김) -->
    ${category1List
      .map((cat1Name) => {
        const category2List = Object.keys(categories[cat1Name]);
        return `
    <div id="category2-${cat1Name}" data-category1="${cat1Name}" class="category2-group flex flex-wrap gap-2 hidden">
      ${category2List
        .map((cat2Name) => {
          return `
      <button data-category1="${cat1Name}" data-category2="${cat2Name}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
        ${cat2Name}
      </button>`;
        })
        .join("")}
    </div>
    `;
      })
      .join("")}

  </div>
</div>`;
};
