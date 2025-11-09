const depth1Style =
  "category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

export function CategoryFilter({ mainCategory, subCategory }) {
  const breadcrumb = mainCategory
    ? html` <span class="text-xs text-gray-500">&gt;</span>
        <button
          data-breadcrumb="category1"
          data-category1="${mainCategory}"
          class="text-xs hover:text-blue-800 hover:underline"
        >
          ${mainCategory}
        </button>`
    : "";

  const breadcrumb2 = subCategory
    ? html`<span class="text-xs text-gray-500">&gt;</span>
        <span class="text-xs text-gray-600 cursor-default">${subCategory}</span>`
    : "";

  return html`
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
        ${breadcrumb} ${breadcrumb2}
      </div>
      <div class="space-y-2">
        <div class="flex flex-wrap gap-2">
          <button data-category1="생활/건강" class="${depth1Style}">생활/건강</button>
          <button data-category1="디지털/가전" class="${depth1Style}">디지털/가전</button>
        </div>
      </div>
    </div>
  `;
}
