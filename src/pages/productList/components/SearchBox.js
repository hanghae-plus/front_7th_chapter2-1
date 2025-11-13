// ------------------------------
// 전역 상태
// ------------------------------
let categoryLoading = false;
let categoryData = {};
let onCategoryChange = null; // 카테고리 변경 콜백
let onLimitChange = null; // limit 변경 콜백
let onSortChange = null; // sort 변경 콜백
let selectedCategory1 = null; // 선택된 카테고리1
let selectedCategory2 = null; // 선택된 카테고리2
let selectedLimit = 20; // 선택된 limit
let selectedSort = "price_asc"; // 선택된 sort
let filterEventsAttached = false; // 필터 이벤트 등록 여부

// ------------------------------
// FilterSelect 컴포넌트 (개수, 정렬)
// ------------------------------
const FilterSelect = () => {
  return `
    <div class="flex gap-2 items-center justify-between" id="filter-select-container">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select id="limit-select" class="text-sm border border-gray-300 rounded px-2 py-1
                                        focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          <option value="10" ${selectedLimit === 10 ? "selected" : ""}>10개</option>
          <option value="20" ${selectedLimit === 20 ? "selected" : ""}>20개</option>
          <option value="50" ${selectedLimit === 50 ? "selected" : ""}>50개</option>
          <option value="100" ${selectedLimit === 100 ? "selected" : ""}>100개</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">정렬:</label>
        <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                                      focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
          <option value="price_asc" ${selectedSort === "price_asc" ? "selected" : ""}>가격 낮은순</option>
          <option value="price_desc" ${selectedSort === "price_desc" ? "selected" : ""}>가격 높은순</option>
          <option value="name_asc" ${selectedSort === "name_asc" ? "selected" : ""}>이름순</option>
          <option value="name_desc" ${selectedSort === "name_desc" ? "selected" : ""}>이름 역순</option>
        </select>
      </div>
    </div>
  `;
};

// ------------------------------
// SearchBox 렌더링
// ------------------------------
export const SearchBox = (
  loading = false,
  categories = {},
  onCategoryChangeCallback = null,
  onLimitChangeCallback = null,
  onSortChangeCallback = null,
  currentLimit = 20,
  currentSort = "price_asc",
  currentCategory1 = null,
  currentCategory2 = null,
) => {
  categoryLoading = loading;
  categoryData = categories; // 이미 객체 형태로 받음
  onCategoryChange = onCategoryChangeCallback;
  onLimitChange = onLimitChangeCallback;
  onSortChange = onSortChangeCallback;

  // 현재 선택된 값 업데이트
  selectedLimit = currentLimit;
  selectedSort = currentSort;
  selectedCategory1 = currentCategory1;
  selectedCategory2 = currentCategory2;

  setTimeout(() => {
    // DOM이 교체된 후 실행되므로 여기서 플래그 리셋
    filterEventsAttached = false;

    renderCategoryUI(selectedCategory1, selectedCategory2);
    // renderFilterSelect()는 호출하지 않음 - 이미 HTML에 포함되어 있음
    attachFilterEvents();
  }, 0);

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
          ${FilterSelect()}
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
const CategoryFilter = (categories, depth = 1, parentCategory = null, selectedCat2 = null) =>
  categories
    .map((category) => {
      const dataAttrs =
        depth === 1
          ? `data-category1="${category}"`
          : `data-category1="${parentCategory}" data-category2="${category}"`;

      // depth가 1일 때는 selectedCategory1과 비교, depth가 2일 때는 selectedCategory2와 비교
      const isSelected = depth === 1 ? category === selectedCategory1 : category === selectedCat2;

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
const renderCategoryUI = (cat1 = null, cat2 = null) => {
  const container = document.querySelector("#category-container");
  if (!container) return;

  console.log("renderCategoryUI called with:", { cat1, cat2, selectedCategory1, selectedCategory2 });

  const categories = cat1 ? Object.keys(categoryData[cat1] || {}) : Object.keys(categoryData);
  const depth = cat1 ? 2 : 1;

  container.innerHTML = `
      ${createBreadcrumb(cat1, cat2)}
      <div class="flex flex-wrap gap-2">
        ${categoryLoading ? Loading() : CategoryFilter(categories, depth, cat1, cat2)}
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
      selectedCategory1 = selected;
      selectedCategory2 = null;
      renderCategoryUI(selected, null);
      // 카테고리 변경 콜백 호출
      if (onCategoryChange) {
        onCategoryChange(selected, null);
      }
    }),
  );

  document.querySelectorAll(".category2-filter-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const selected1 = e.currentTarget.dataset.category1;
      const selected2 = e.currentTarget.dataset.category2;
      selectedCategory1 = selected1;
      selectedCategory2 = selected2;
      renderCategoryUI(selected1, selected2);
      // 카테고리 변경 콜백 호출
      if (onCategoryChange) {
        onCategoryChange(selected1, selected2);
      }
    }),
  );

  const resetBtn = document.querySelector('[data-breadcrumb="reset"]');
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      selectedCategory1 = null;
      selectedCategory2 = null;
      renderCategoryUI(null, null);
      // 카테고리 리셋 콜백 호출
      if (onCategoryChange) {
        onCategoryChange(null, null);
      }
    });
  }

  // 브레드크럼의 category1 버튼
  const category1Breadcrumb = document.querySelector('[data-breadcrumb="category1"]');
  if (category1Breadcrumb) {
    category1Breadcrumb.addEventListener("click", (e) => {
      const selected = e.currentTarget.dataset.category1;
      selectedCategory1 = selected;
      selectedCategory2 = null;
      renderCategoryUI(selected, null);
      // 카테고리 변경 콜백 호출
      if (onCategoryChange) {
        onCategoryChange(selected, null);
      }
    });
  }
};

// ------------------------------
// 필터 이벤트 연결 (limit, sort)
// ------------------------------
const attachFilterEvents = () => {
  // 이미 이벤트가 등록되어 있으면 스킵
  if (filterEventsAttached) {
    console.log("Filter events already attached, skipping...");
    return;
  }

  console.log("Attaching filter events...");

  // Limit 변경 이벤트
  const limitSelect = document.querySelector("#limit-select");
  if (limitSelect) {
    limitSelect.addEventListener("change", (e) => {
      const limit = parseInt(e.target.value, 10);
      selectedLimit = limit; // 전역 상태 업데이트
      console.log("Limit changed to:", limit);
      if (onLimitChange) {
        console.log("Calling onLimitChange callback");
        onLimitChange(limit);
      } else {
        console.warn("onLimitChange callback is not defined!");
      }
    });
    console.log("Limit select event attached");
  } else {
    console.warn("limit-select element not found!");
  }

  // Sort 변경 이벤트
  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const sort = e.target.value;
      selectedSort = sort; // 전역 상태 업데이트
      console.log("Sort changed to:", sort);
      if (onSortChange) {
        console.log("Calling onSortChange callback");
        onSortChange(sort);
      } else {
        console.warn("onSortChange callback is not defined!");
      }
    });
    console.log("Sort select event attached");
  } else {
    console.warn("sort-select element not found!");
  }

  filterEventsAttached = true;
  console.log("Filter events attached successfully");
};
