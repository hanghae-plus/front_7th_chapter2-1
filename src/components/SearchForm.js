const categoryLoading = /* html */ `
    <div class="flex flex-wrap gap-2">
      <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
    </div>
  `;

const categoryList = ({ categories }) => {
  return /* html */ `
    <div class="flex flex-wrap gap-2">
      ${Object.keys(categories)
        .map(
          (category1) => /* html */ `
          <button data-category1="${category1}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
          bg-white border-gray-300 text-gray-700 hover:bg-gray-50">${category1}</button>
        `,
        )
        .join("")}
    </div>  
  `;
};

const category2List = ({ categories, category1, selectedCategory2 }) => {
  if (!category1 || !categories[category1]) return "";

  const subCategories = categories[category1];

  return /* html */ `
    <div class="flex flex-wrap gap-2">
      ${Object.keys(subCategories)
        .map((category2) => {
          // 선택된 2depth 카테고리인지 확인
          const isActive = selectedCategory2 === category2;
          const activeClasses = isActive
            ? "bg-blue-100 border-blue-300 text-blue-800"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

          return /* html */ `
              <button data-category1="${category1}" 
                      data-category2="${category2}" 
                      class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${activeClasses}">
                ${category2}
              </button>
            `;
        })
        .join("")}
    </div>  
  `;
};

export const SearchForm = ({
  loading,
  categories,
  category1,
  category2,
  limit = 20,
  sort = "price_asc",
  search = "",
}) => {
  return /* html */ `
    <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      <div class="mb-4">
        <div class="relative">
          <input type="text" id="search-input" placeholder="상품명을 검색해보세요 (엔터로 검색)" value="${search}" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
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
            ${category1 ? `<span class="text-xs text-gray-500">&gt;</span>` : ""}
            ${category1 ? `<button data-breadcrumb="category1" data-category1="${category1}" class="text-xs hover:text-blue-800 hover:underline">${category1}</button>` : ""}
            ${category2 ? `<span class="text-xs text-gray-500">&gt;</span>` : ""}
            ${category2 ? `<button data-breadcrumb="category2" data-category2="${category2}" class="text-xs hover:text-blue-800 hover:underline">${category2}</button>` : ""}
            </div>
          <!-- 1depth 카테고리 -->
          ${!category1 ? (loading ? categoryLoading : categoryList({ categories })) : ""}
          <!-- 2depth 카테고리 -->
          ${category1 ? category2List({ categories, category1, selectedCategory2: category2 }) : ""}
        </div>
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            <select id="limit-select"
                    class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="10" ${limit === 10 ? "selected" : ""}>
                10개
              </option>
              <option value="20" ${limit === 20 ? "selected" : ""}>
                20개
              </option>
              <option value="50" ${limit === 50 ? "selected" : ""}>
                50개
              </option>
              <option value="100" ${limit === 100 ? "selected" : ""}>
                100개
              </option>
            </select>
          </div>
          <!-- 정렬 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>
            <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                          focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="price_asc" ${sort === "price_asc" ? "selected" : ""}>가격 낮은순</option>
              <option value="price_desc" ${sort === "price_desc" ? "selected" : ""}>가격 높은순</option>
              <option value="name_asc" ${sort === "name_asc" ? "selected" : ""}>이름순</option>
              <option value="name_desc" ${sort === "name_desc" ? "selected" : ""}>이름 역순</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
};
