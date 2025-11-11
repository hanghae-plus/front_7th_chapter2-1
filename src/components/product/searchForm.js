export default function searchForm(props = {}) {
  const { params = {}, categories = {} } = props;
  const { search = "", category1 = "", category2 = "" } = params;

  // let categories = productStore.getState().categories;
  console.log("카테고리 정보", categories);

  // 검색창
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

  // 브래드크럼
  let breadcrumbHTML =
    '<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>';
  if (category1) {
    breadcrumbHTML += `<span class="text-xs text-gray-500">&gt;</span>
      <button data-breadcrumb="category1" data-category1="${category1}" class="text-xs hover:text-blue-800 hover:underline">${category1}</button>`;
  }
  if (category2) {
    breadcrumbHTML += `<span class="text-xs text-gray-500">&gt;</span>
      <span class="text-xs text-gray-600 cursor-default">${category2}</span>`;
  }

  // 카테고리 버튼 (1-depth 또는 2-depth) 생성
  let categoryButtonsHTML = "";
  let currentCategories = {}; // 현재 보여줄 카테고리 목록

  if (!category1) {
    // 1-depth (category1) 보여주기
    currentCategories = categories;
    categoryButtonsHTML = Object.keys(currentCategories)
      .map((cat1) => {
        return `<button data-category1="${cat1}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                   bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  ${cat1}
                </button>`;
      })
      .join("");
  } else if (categories[category1] && !category2) {
    // 2-depth (category2) 보여주기
    currentCategories = categories[category1];
    categoryButtonsHTML = Object.keys(currentCategories)
      .map((cat2) => {
        return `<button data-category1="${category1}" data-category2="${cat2}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors 
                   bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                  ${cat2}
                </button>`;
      })
      .join("");
  } else if (categories[category1] && category2) {
    // 2-depth (category2) 보여주기 (선택된 상태)
    currentCategories = categories[category1];
    categoryButtonsHTML = Object.keys(currentCategories)
      .map((cat2) => {
        const isSelected = cat2 === category2;
        const selectedClass = isSelected
          ? "bg-blue-100 border-blue-300 text-blue-800"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
        return `<button data-category1="${category1}" data-category2="${cat2}" class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${selectedClass}">
                  ${cat2}
                </button>`;
      })
      .join("");
  }

  // 카테고리 로딩 중...
  if (Object.keys(categories).length === 0 && !category1) {
    categoryButtonsHTML = '<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>';
  }

  let catergoryFilter = `
    <div class="space-y-2">
      <div class="flex items-center gap-2" id="product-breadcrumb">
        <label class="text-sm text-gray-600">카테고리:</label>
        ${breadcrumbHTML}
      </div>
      <div class="flex flex-wrap gap-2" id="product-category">
        ${categoryButtonsHTML}
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
    <div class="flex gap-2 items-center justify-between">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select id="limit-select" class="text-sm border border-gray-300 rounded px-2 py-1 ...">
          ${pageSizeOption
            .map((size) => {
              return `<option value="${size.value}" ${
                Number(params.limit) === size.value ? "selected" : ""
              }>${size.label}</option>`;
            })
            .join("")}
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">정렬:</label>
        <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1 ...">
          ${sortOption
            .map((sort) => {
              return `<option value="${sort.value}" ${
                params.sort === sort.value ? "selected" : ""
              }>${sort.label}</option>`;
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
