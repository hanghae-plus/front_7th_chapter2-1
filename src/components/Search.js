import { SearchFirstDepth } from "./SearchFirstDepth.js";
import { SearchTwoDepth } from "./SearchTwoDepth.js";

const SearchLoading = `
  <div class="flex flex-wrap gap-2">
    <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
  </div>
`;

const renderRootCategories = (categories = {}, selectedCategory1 = null) => {
  const categoryKeys = Object.keys(categories);

  if (categoryKeys.length === 0) {
    return `
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">카테고리:</label>
          <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
        </div>
        <div class="text-sm text-gray-400">표시할 카테고리가 없습니다.</div>
      </div>
    `;
  }

  const buttons = categoryKeys
    .sort((a, b) => a.localeCompare(b, "ko"))
    .map((category1) => {
      const isActive = category1 === selectedCategory1;
      const baseClass = "category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors";
      const variantClass = isActive
        ? "bg-blue-600 border-blue-600 text-white"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
      return `
        <button data-category1="${category1}" class="${baseClass} ${variantClass}">
          ${category1}
        </button>
      `;
    })
    .join("");

  return `
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
      </div>
      <div class="flex flex-wrap gap-2">
        ${buttons}
      </div>
    </div>
  `;
};

const renderCategorySection = ({ loading, categories, selectedCategory1, selectedCategory2 }) => {
  if (loading) {
    return SearchLoading;
  }

  if (!selectedCategory1) {
    return renderRootCategories(categories, selectedCategory1);
  }

  const category2Source = categories?.[selectedCategory1];
  const category2List = Array.isArray(category2Source)
    ? category2Source
    : Object.keys(category2Source ?? {}).sort((a, b) => a.localeCompare(b, "ko"));

  if (selectedCategory2) {
    return SearchTwoDepth({
      category1: selectedCategory1,
      activeCategory2: selectedCategory2,
      category2List,
    });
  }

  return SearchFirstDepth({
    category1: selectedCategory1,
    category2List,
  });
};

const renderLimitOption = (value, current) => `
  <option value="${value}" ${current === value ? "selected" : ""}>${value}개</option>
`;

const renderSortOption = (value, current, label) => `
  <option value="${value}" ${current === value ? "selected" : ""}>${label}</option>
`;

export const Search = ({
  loading = false,
  limit = 20,
  sort = "price_asc",
  selectedCategory1 = null,
  selectedCategory2 = null,
  categories = {},
} = {}) => {
  return /*html*/ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            id="search-input"
            placeholder="상품명을 검색해보세요..."
            value=""
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        ${renderCategorySection({ loading, categories, selectedCategory1, selectedCategory2 })}

        <div class="flex gap-2 items-center justify-between">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600" for="limit-select">개수:</label>
            <select
              id="limit-select"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              ${[10, 20, 50, 100].map((option) => renderLimitOption(option, limit)).join("")}
            </select>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600" for="sort-select">정렬:</label>
            <select
              id="sort-select"
              class="text-sm border border-gray-300 rounded px-2 py-1
                focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              ${[
                ["price_asc", "가격 낮은순"],
                ["price_desc", "가격 높은순"],
                ["name_asc", "이름순"],
                ["name_desc", "이름 역순"],
              ]
                .map(([value, label]) => renderSortOption(value, sort, label))
                .join("")}
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
};
