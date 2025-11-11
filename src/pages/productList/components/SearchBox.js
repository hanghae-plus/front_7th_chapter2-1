const categoryData = {
  "생활/건강": ["생활용품", "건강식품", "의료용품"],
  "디지털/가전": ["TV", "컴퓨터", "스마트폰", "주방가전"],
  "패션/잡화": ["의류", "신발", "가방"],
};

// ------------------------------
// 전역 로딩 상태
// ------------------------------
let categoryLoading = false;

// ------------------------------
// SearchBox 렌더링
// ------------------------------
export const SearchBox = (loading = false) => {
  categoryLoading = loading;
  setTimeout(() => renderCategoryUI(), 0);

  return `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
  
        <!-- 검색창 -->
        <div class="mb-4 relative">
          <input type="text" id="search-input" placeholder="상품명을 검색해보세요..."
                 class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
  
        <!-- 필터 옵션 -->
        <div class="space-y-3">
          <div id="category-container" class="space-y-2"></div>
  
          <div class="flex gap-2 items-center justify-between">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select id="limit-select" class="text-sm border border-gray-300 rounded px-2 py-1
                                              focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="10">10개</option>
                <option value="20" selected>20개</option>
                <option value="50">50개</option>
                <option value="100">100개</option>
              </select>
            </div>
  
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                                            focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="price_asc" selected>가격 낮은순</option>
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

// ------------------------------
// 공통 버튼 생성
// ------------------------------
const createButton = ({ text, classes = "", dataAttrs = "" }) =>
  `<button ${dataAttrs} class="${classes}">${text}</button>`;

// ------------------------------
// 카테고리 버튼 생성
// ------------------------------
const CategoryFilter = (categories, depth = 1, parentCategory = null, selectedCategory2 = null) =>
  categories
    .map((category) => {
      const dataAttrs =
        depth === 1
          ? `data-category1="${category}"`
          : `data-category1="${parentCategory}" data-category2="${category}"`;

      const isSelected = depth === 2 && category === selectedCategory2;

      return createButton({
        text: category,
        classes: `category${depth}-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                    ${isSelected ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`,
        dataAttrs,
      });
    })
    .join("");

// ------------------------------
// 브레드크럼 생성
// ------------------------------
const createBreadcrumb = (selectedCategory1, selectedCategory2 = null) => {
  const resetBtn = createButton({
    text: "전체",
    classes: "text-xs hover:text-blue-800 hover:underline",
    dataAttrs: 'data-breadcrumb="reset"',
  });

  if (!selectedCategory1) {
    return `<div class="flex items-center gap-2"><label class="text-sm text-gray-600">카테고리:</label>${resetBtn}</div>`;
  }

  let html = `
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        ${resetBtn}
        <span class="text-xs text-gray-500">&gt;</span>
        ${createButton({
          text: selectedCategory1,
          classes: "text-xs hover:text-blue-800 hover:underline",
          dataAttrs: `data-breadcrumb="category1" data-category1="${selectedCategory1}"`,
        })}
    `;

  if (selectedCategory2) {
    html += `<span class="text-xs text-gray-500">&gt;</span>
               <span class="text-xs text-gray-600 cursor-default">${selectedCategory2}</span>`;
  }

  html += `</div>`;
  return html;
};

// ------------------------------
// 로딩 UI
// ------------------------------
const Loading = () => `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`;

// ------------------------------
// 카테고리 UI 렌더링
// ------------------------------
const renderCategoryUI = (selectedCategory1 = null, selectedCategory2 = null) => {
  const container = document.querySelector("#category-container");
  if (!container) return;

  const categories = selectedCategory1 ? categoryData[selectedCategory1] || [] : Object.keys(categoryData);
  const depth = selectedCategory1 ? 2 : 1;

  container.innerHTML = `
      ${createBreadcrumb(selectedCategory1, selectedCategory2)}
      <div class="flex flex-wrap gap-2">
        ${categoryLoading ? Loading() : CategoryFilter(categories, depth, selectedCategory1, selectedCategory2)}
      </div>
    `;

  attachCategoryEvents();
};

// ------------------------------
// 이벤트 연결
// ------------------------------
const attachCategoryEvents = () => {
  document.querySelectorAll(".category1-filter-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const selected = e.currentTarget.dataset.category1;
      renderCategoryUI(selected);
    }),
  );

  document.querySelectorAll(".category2-filter-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const selected1 = e.currentTarget.dataset.category1;
      const selected2 = e.currentTarget.dataset.category2;
      renderCategoryUI(selected1, selected2);
    }),
  );

  const resetBtn = document.querySelector('[data-breadcrumb="reset"]');
  if (resetBtn) resetBtn.addEventListener("click", () => renderCategoryUI());
};
