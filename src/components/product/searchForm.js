export default function searchForm(params = {}) {
  const { search = "", limit = 20, sort = "price_asc" } = params;

  let searchInput = `
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input 
              type="text" 
              id="search-input" 
              placeholder="상품명을 검색해보세요..." 
              value="${search}" 
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>`;

  let catergoryFilter = `
          <!-- 카테고리 필터 -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">카테고리:</label>
              <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
              <span class="text-xs text-gray-500">&gt;</span>
              <button data-breadcrumb="category1" data-category1="생활/건강" class="text-xs hover:text-blue-800 hover:underline">생활/건강</button>
            </div>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <button data-category1="생활/건강" data-category2="생활용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  생활용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="주방용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800">
                  주방용품
                </button>
                <button data-category1="생활/건강" data-category2="문구/사무용품" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  문구/사무용품
                </button>
              </div>
            </div>
          </div>`;

  let pageSizeOption = [
    { label: "10개", value: 10 },
    { label: "20개", value: 20 },
    { label: "50개", value: 50 },
    { label: "100개", value: 100 },
  ];
  let sortOption = [
    { label: "가격 낮은순", value: "price_asc" },
    { label: "가격 높은순", value: "price_desc" },
    { label: "이름순", value: "name_asc" },
    { label: "이름 역순", value: "name_desc" },
  ];
  let filterOptions = `
  <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select id="limit-select"
                      class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                ${pageSizeOption
                  .map((size) => {
                    return `<option value="${size.value}" ${limit === size.value ? "selected" : ""}>${
                      size.label
                    }</option>`;
                  })
                  .join("")}
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                           focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                ${sortOption
                  .map((s) => {
                    return `<option value="${s.value}" ${sort === s.value ? "selected" : ""}>${s.label}</option>`;
                  })
                  .join("")}
              </select>
            </div>
          </div>`;

  return `
      ${searchInput}
      <div class="space-y-3">
      ${catergoryFilter}
      ${filterOptions}
      </div>
      `;
}
