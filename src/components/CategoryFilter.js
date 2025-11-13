const CategoryFilter1Depth = ({ category1, subCategories = [] }) => {
  return `
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
        <span class="text-xs text-gray-500">&gt;</span>
        <button data-breadcrumb="category1" data-category1="${category1}" class="text-xs hover:text-blue-800 hover:underline">${category1}</button>
      </div>
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          ${subCategories
            .map(
              (cat) => `
            <button data-category1="${category1}" data-category2="${cat}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              ${cat}
            </button>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
};

const CategoryFilter2Depth = ({ category1, category2, subCategories = [] }) => {
  return `
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
        <span class="text-xs text-gray-500">&gt;</span>
        <button data-breadcrumb="category1" data-category1="${category1}" class="text-xs hover:text-blue-800 hover:underline">${category1}</button>
        <span class="text-xs text-gray-500">&gt;</span>
        <span class="text-xs text-gray-600 cursor-default">${category2}</span>
      </div>
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          ${subCategories
            .map(
              (cat) => `
            <button data-category1="${category1}" data-category2="${cat}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${cat === category2 ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}">
              ${cat}
            </button>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
};

export { CategoryFilter1Depth, CategoryFilter2Depth };
