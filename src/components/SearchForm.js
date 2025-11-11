export const SearchForm = ({ filters = { search: "" }, categories = {} }) => {
  return `
        <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            id="search-input"
            placeholder="상품명을 검색해보세요..."
            value="${filters.search}"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            ${
              filters.category1
                ? `<span class="text-xs text-gray-500">&gt;</span><button data-breadcrumb="category1" data-category1="${filters.category1}" class="text-xs hover:text-blue-800 hover:underline">${filters.category1}</button>`
                : ""
            }
            ${
              filters.category1 && filters.category2
                ? `<span class="text-xs text-gray-500">&gt;</span><span class="text-xs text-gray-600 cursor-default">${filters.category2}</span>`
                : ""
            }
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              ${
                !categories
                  ? `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`
                  : `<div class="flex flex-wrap gap-2">
                    ${
                      !filters.category1
                        ? Object.keys(categories).map(Category1Item).join("")
                        : Object.keys(categories[filters.category1] ?? {})
                            .map((category2) =>
                              Category2Item({
                                category1: filters.category1,
                                category2,
                                isSelected: filters.category2 === category2,
                              }),
                            )
                            .join("")
                    }
              </div>`
              }
            </div>
          </div>
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
              <option value="10">10개</option>
              <option value="20" selected="">20개</option>
              <option value="50">50개</option>
              <option value="100">100개</option>
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
              <option value="price_asc" selected="">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
              <option value="name_asc">이름순</option>
              <option value="name_desc">이름 역순</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    `;
};

const Category1Item = (category1) => {
  return `
    <button
      data-category1="${category1}"
      class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      ${category1}
    </button>`;
};

const Category2Item = ({ category1, category2, isSelected }) => {
  const buttonClass = isSelected
    ? "bg-blue-100 border-blue-300 text-blue-800"
    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
  return `
    <button
      data-category1="${category1}"
      data-category2="${category2}"
      class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${buttonClass}"
    >
      ${category2}
    </button>`;
};
