// @ts-check

/**
 * @typedef {import('../view-models/CategoryViewModel.js').CategoryViewModel} CategoryViewModel
 */

/**
 * @param {Object} props
 * @param {CategoryViewModel} props.viewModel
 * @returns {string}
 */
export default function CategoryFilter({ viewModel }) {
  const firstDepthOptions = viewModel.getFirstDepthOptions();
  const secondDepthOptions = viewModel.getSecondDepthOptions();

  const selectedCategory1 = viewModel.selectedCategory1;
  const selectedCategory2 = viewModel.selectedCategory2;

  return /* HTML */ `
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
        ${selectedCategory1 &&
        /* HTML */ `
          <span class="text-xs text-gray-500">&gt;</span>
          <button
            data-breadcrumb="category1"
            data-category1="${selectedCategory1}"
            class="text-xs hover:text-blue-800 hover:underline"
          >
            ${selectedCategory1}
          </button>
        `}
        ${selectedCategory2 &&
        /* HTML */ `
          <span class="text-xs text-gray-500">&gt;</span>
          <span class="text-xs text-gray-600 cursor-default">${selectedCategory2}</span>
        `}
      </div>
      <!-- 1depth 카테고리 -->
      <div class="flex flex-wrap gap-2">
        ${(!selectedCategory2 && !selectedCategory1
          ? firstDepthOptions.map(
              (option) => /* HTML */ `
                <button
                  id="category-filter-btn"
                  data-category1="${option.value}"
                  class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
              ${option.selected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                >
                  ${option.label}
                </button>
              `,
            )
          : secondDepthOptions.map(
              (option) => /* HTML */ `
                <button
                  id="category-filter-btn"
                  data-category1="${selectedCategory1}"
                  data-category2="${option.value}"
                  class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                  ${option.selected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                >
                  ${option.label}
                </button>
              `,
            )
        ).join("\n")}
      </div>
    </div>
  `;
}
