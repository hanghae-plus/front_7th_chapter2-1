import { Category } from "./Category";

const LIMIT_PRESETS = [
  { value: 10, label: "10개" },
  { value: 20, label: "20개" },
  { value: 50, label: "50개" },
  { value: 100, label: "100개" },
];

const SORT_PRESETS = [
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "name_asc", label: "이름순" },
  { value: "name_desc", label: "이름 역순" },
];

const buildOptions = (options, selectedValue) =>
  options
    .map(
      ({ value, label }) => `
          <option value="${value}" ${String(value) === String(selectedValue) ? "selected" : ""}>
            ${label}
          </option>`,
    )
    .join("");

export const SearchForm = ({ categories, filters, pagination }) => {
  const { category1 = null, category2 = null, search = "", sort = "price_asc" } = filters || {};
  const limit = pagination?.limit ?? filters?.limit ?? 20;
  return /*html*/ `
<!-- 검색 및 필터 -->
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
  <!-- 검색창 -->
  <div class="mb-4">
    <div class="relative">
      <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="${search}" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>
  </div>
  <!-- 필터 옵션 -->
  <div class="space-y-3">
    <!--  카테고리 -->
    ${
      categories
        ? `
    ${Category({ categories, selectedCat1: category1, selectedCat2: category2 })}`
        : `<div class="flex flex-wrap gap-2">
      <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
    </div>`
    }

    <!-- 기존 필터들 -->
    <div class="flex gap-2 items-center justify-between">
      <!-- 페이지당 상품 수 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select id="limit-select" class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          ${buildOptions(LIMIT_PRESETS, limit)}
        </select>
      </div>
      <!-- 정렬 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">정렬:</label>
        <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                             focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          ${buildOptions(SORT_PRESETS, sort)}
        </select>
      </div>
    </div>
  </div>
</div>
`;
};
