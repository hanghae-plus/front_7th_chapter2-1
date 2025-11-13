import { escapeHtml } from "../../lib/utils/format.js";
import { DEFAULT_LIMIT, DEFAULT_SORT, LIMIT_OPTIONS, SORT_OPTIONS } from "../../lib/config/catalog.js";

const categoryButtonBaseClasses = "text-left px-3 py-2 text-sm rounded-md border transition-colors";
const categoryButtonDefaultClasses = "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
const categoryButtonActiveClasses = "bg-blue-600 border-blue-600 text-white hover:bg-blue-700";

const renderCategorySection = ({ categoryState, selectedCategory1 = "", selectedCategory2 = "" } = {}) => {
  const { data = [], isLoading = false, error = null } = categoryState ?? {};

  const breadcrumbParts = [
    '<span class="text-sm text-gray-600">카테고리:</span>',
    '<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>',
  ];

  if (selectedCategory1) {
    breadcrumbParts.push(
      '<span class="text-xs text-gray-400">/</span>',
      `<button data-breadcrumb="category1" data-category1="${escapeHtml(selectedCategory1)}" class="text-xs hover:text-blue-800 hover:underline">${escapeHtml(selectedCategory1)}</button>`,
    );
  }

  if (selectedCategory2) {
    breadcrumbParts.push(
      '<span class="text-xs text-gray-400">/</span>',
      `<button data-breadcrumb="category2" data-category1="${escapeHtml(selectedCategory1)}" data-category2="${escapeHtml(selectedCategory2)}" class="text-xs hover:text-blue-800 hover:underline">${escapeHtml(selectedCategory2)}</button>`,
    );
  }

  let firstLevelMarkup = "";
  if (isLoading) {
    firstLevelMarkup = '<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>';
  } else if (error) {
    firstLevelMarkup = `<div class="text-sm text-red-600">${escapeHtml(error)}</div>`;
  } else if (!data.length) {
    firstLevelMarkup = '<div class="text-sm text-gray-500 italic">카테고리 정보가 없습니다.</div>';
  } else {
    firstLevelMarkup = `
      <div class="flex flex-wrap gap-2">
        ${data
          .map(({ name }) => {
            const isActive = name === selectedCategory1;
            const classes = `${categoryButtonBaseClasses} ${isActive ? categoryButtonActiveClasses : categoryButtonDefaultClasses}`;
            return `<button class="category1-filter-btn ${classes}" data-category1="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
          })
          .join(" ")}
      </div>
    `;
  }

  let secondLevelMarkup = "";
  if (!isLoading && !error && selectedCategory1) {
    const targetCategory = data.find(({ name }) => name === selectedCategory1);
    if (targetCategory?.children?.length) {
      secondLevelMarkup = `
        <div class="flex flex-wrap gap-2">
          ${targetCategory.children
            .map((childName) => {
              const isActive = childName === selectedCategory2;
              const classes = `${categoryButtonBaseClasses} ${isActive ? categoryButtonActiveClasses : categoryButtonDefaultClasses}`;
              return `<button class="category2-filter-btn ${classes}" data-category1="${escapeHtml(selectedCategory1)}" data-category2="${escapeHtml(childName)}">${escapeHtml(childName)}</button>`;
            })
            .join(" ")}
        </div>
      `;
    }
  }

  return `
    <div class="space-y-2">
      <div class="flex items-center gap-2 flex-wrap text-xs text-gray-600">
        ${breadcrumbParts.join(" ")}
      </div>
      ${firstLevelMarkup}
      ${secondLevelMarkup}
    </div>
  `;
};

const createLimitOptions = (selectedLimit = DEFAULT_LIMIT) =>
  LIMIT_OPTIONS.map((limit) => {
    const isSelected = limit === selectedLimit ? " selected" : "";
    return `<option value="${limit}"${isSelected}>${limit}개</option>`;
  }).join("");

const createSortOptions = (selectedSort = DEFAULT_SORT) =>
  SORT_OPTIONS.map(({ value, label }) => {
    const isSelected = value === selectedSort ? " selected" : "";
    return `<option value="${value}"${isSelected}>${label}</option>`;
  }).join("");

export const renderFilterPanel = ({
  searchValue = "",
  selectedLimit = DEFAULT_LIMIT,
  selectedSort = DEFAULT_SORT,
  categoryState,
  selectedCategory1 = "",
  selectedCategory2 = "",
} = {}) => `
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <div class="mb-4">
      <div class="relative">
        <input
          type="text"
          id="search-input"
          placeholder="상품명을 검색해보세요..."
          value="${escapeHtml(searchValue)}"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="space-y-3">
      ${renderCategorySection({ categoryState, selectedCategory1, selectedCategory2 })}
      <div class="flex gap-2 items-center justify-between">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">개수:</label>
          <select id="limit-select" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            ${createLimitOptions(selectedLimit)}
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">정렬:</label>
          <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            ${createSortOptions(selectedSort)}
          </select>
        </div>
      </div>
    </div>
  </div>
`;
