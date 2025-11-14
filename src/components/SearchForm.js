import { filters } from "../store/filters";

const CategoryButton = (category) => {
  return /*HTML*/ `
  <button data-category1="${category}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">${category}</button>
`;
};

export const Category2Button = (category1, category2, isSelected = false) => {
  return /* HTML */ `
    <button
      data-category1="${category1}"
      data-category2="${category2}"
      class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${isSelected
        ? "bg-blue-100 border-blue-300 text-blue-800"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
    >
      ${category2}
    </button>
  `;
};

export const CategoryBreadcrumb = (category1, category2) => {
  return /* HTML */ `
    ${category2
      ? /* HTML */ `
          <span class="text-xs text-gray-500">&gt;</span>
          <span class="text-xs text-gray-600 cursor-default">${category2}</span>
        `
      : /* HTML */ `
          <span class="text-xs text-gray-500">&gt;</span
          ><button
            data-breadcrumb="category1"
            data-category1="${category1}"
            class="text-xs hover:text-blue-800 hover:underline"
          >
            ${category1}
          </button>
        `}
  `;
};

const getSortLabel = (sort) => {
  switch (sort) {
    case "price_asc":
      return "가격 낮은순";
    case "price_desc":
      return "가격 높은순";
    case "name_asc":
      return "이름순";
    case "name_desc":
      return "이름 역순";
    default:
      return "가격 낮은순";
  }
};

export const SearchForm = ({ categories, isLoading }) => {
  const filtersState = filters.getState();

  return /* HTML */ `
    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            id="search-input"
            placeholder="상품명을 검색해보세요..."
            value="${filtersState.search}"
            class="w-full pl-10 pr-4
          py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">카테고리:</label>
            <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
            ${filtersState.category1 ? CategoryBreadcrumb(filtersState.category1) : ""}
            ${filtersState.category2 ? CategoryBreadcrumb(filtersState.category1, filtersState.category2) : ""}
          </div>
          <!-- 1depth 카테고리 -->
          ${(isLoading &&
            /* HTML */ `<div class="flex flex-wrap gap-2">
              <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
            </div>`) ||
          ""}
          <!-- 1depth 카테고리 버튼 -->
          ${(!isLoading &&
            !filtersState.category1 &&
            /* HTML */ `<div class="flex flex-wrap gap-2" id="category-filter-buttons">
              ${Object.keys(categories).map(CategoryButton).join("")}
            </div>`) ||
          ""}
          <!-- 2depth 카테고리 버튼 -->
          ${(!isLoading &&
            filtersState.category1 &&
            /* HTML */ `<div class="flex flex-wrap gap-2" id="category-filter-buttons">
              ${Object.keys(categories[filtersState.category1])
                .map((category2) => Category2Button(filtersState.category1, category2))
                .join("")}
            </div>`) ||
          ""}
        </div>
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            <select
              id="limit-select"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              ${["10", "20", "50", "100"]
                .map((limit) => {
                  return /* HTML */ `<option value="${limit}" ${limit === filtersState.limit ? "selected" : ""}>
                    ${limit}개
                  </option>`;
                })
                .join("")}
            </select>
          </div>
          <!-- 정렬 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>
            <select
              id="sort-select"
              class="text-sm border border-gray-300 rounded px-2 py-1
                          focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              ${["price_asc", "price_desc", "name_asc", "name_desc"]
                .map((sort) => {
                  return /* HTML */ `<option value="${sort}" ${sort === filtersState.sort ? "selected" : ""}>
                    ${getSortLabel(sort)}
                  </option>`;
                })
                .join("")}
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
};
