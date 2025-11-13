export const SearchBar = ({ search = "" }) => {
  return /*HTML*/ ` <div class="mb-4">
        <div class="relative">
          <input type="text" id="search-input" data-action="filter-search" placeholder="상품명을 검색해보세요..." value="${search}" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>`;
};

export const ItemCountSelector = ({ limit }) => {
  return /*HTML*/ `<!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">개수:</label>
          <select id="limit-select" data-action="filter-limit"
                  class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <option value="10" ${limit == 10 ? "selected" : ""}>
              10개
            </option>
            <option value="20" ${limit == 20 ? "selected" : ""}>
              20개
            </option>
            <option value="50" ${limit == 50 ? "selected" : ""}>
              50개
            </option>
            <option value="100" ${limit == 100 ? "selected" : ""}>
              100개
            </option>
          </select>
        </div>`;
};

export const SortSelector = ({ sort }) => {
  return /*HTML*/ `<!-- 정렬 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" data-action="filter-sort" class="text-sm border border-gray-300 rounded px-2 py-1
                         focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="price_asc" ${sort == "price_asc" ? "selected" : ""}>가격 낮은순</option>
              <option value="price_desc" ${sort == "price_desc" ? "selected" : ""}>가격 높은순</option>
              <option value="name_asc" ${sort == "name_asc" ? "selected" : ""}>이름순</option>
              <option value="name_desc" ${sort == "name_desc" ? "selected" : ""}>이름 역순</option>
            </select>
          </div>`;
};

export const CategoryLoading = () => {
  return `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`;
};

export const CategoryBreadcrumb = ({ category1 = "", category2 = "" }) => {
  const breadcrumbs = [
    { label: "전체", action: "reset" },
    category1 && { label: category1, action: "category1", data: category1 },
    category2 && { label: category2, action: "category2", data: category2 },
  ].filter(Boolean);

  return breadcrumbs
    .map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      const buttonClass = isLast
        ? "text-xs text-gray-600 cursor-default"
        : "text-xs hover:text-blue-800 hover:underline";
      const dataAttrs = crumb.data ? `data-category1="${crumb.data}"` : "";

      return `
        ${index > 0 ? '<span class="text-xs text-gray-500">&gt;</span>' : ""}
        <button data-action="breadcrumb" data-breadcrumb="${crumb.action}" ${dataAttrs} class="${buttonClass}">
          ${crumb.label}
        </button>
      `;
    })
    .join("");
};

export const FirstDepthCategory = ({ category1 }) => {
  return /*HTML*/ ` 
    ${category1
      .map(
        (category) => `
      <button data-action="filter-category1" data-category1="${category}" class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
        ${category}
      </button>
    `,
      )
      .join("")}
  `;
};

export const SecondDepthCategory = ({ category2List = [], selectedCategory2 = "" }) => {
  if (!category2List || category2List.length === 0) return "";

  return /*HTML*/ `
    ${category2List
      .map((category) => {
        const isSelected = category === selectedCategory2;
        const buttonClass = isSelected
          ? "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-blue-100 border-blue-300 text-blue-800"
          : "category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

        return `
      <button data-action="filter-category2" data-category2="${category}" class="${buttonClass}">
        ${category}
      </button>
    `;
      })
      .join("")}
  `;
};

export const Search = ({
  loading,
  categories,
  limit,
  search = "",
  sort = "price_asc",
  category1 = "",
  category2 = "",
}) => {
  const category1List = Object.keys(categories);
  const category2List = category1 ? Object.keys(categories[category1] || {}) : [];

  return /*HTML*/ `   
      <!-- 검색 및 필터 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      ${SearchBar({ search })}
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">카테고리:</label>
            ${CategoryBreadcrumb({ category1, category2 })}
          </div>
          ${
            loading
              ? `    
            <!-- 카테고리 로딩 -->
            <div class="flex flex-wrap gap-2">
              ${CategoryLoading()}
            </div>`
              : category1
                ? /*HTML*/ `
               <!-- Category2 표시 (Category1 선택됨) -->
               <div class="flex flex-wrap gap-2">
                 ${SecondDepthCategory({ category2List, selectedCategory2: category2 })}
               </div>`
                : /*HTML*/ `
               <!-- Category1 표시 (초기 상태) -->
               <div class="flex flex-wrap gap-2">
                 ${FirstDepthCategory({ category1: category1List })}
               </div>`
          }
     
        </div>
       
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          ${ItemCountSelector({ limit })}
          ${SortSelector({ sort })}
        </div>
      </div>
    </div> 
    `;
};
