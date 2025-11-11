const LIMIT_OPTIONS = [10, 20, 50, 100];

const CATEGORY_BUTTON_CLASS =
  "text-left px-3 py-2 text-sm rounded-md border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

const renderLimitOption = (value, current) => {
  const numericValue = Number(value);
  const isSelected = Number(current) === numericValue ? "selected" : "";

  return `<option value="${numericValue}" ${isSelected}>${numericValue}개</option>`;
};

const renderSortOption = (value, label, currentSort) => {
  const isSelected = value === currentSort ? "selected" : "";
  return `<option value="${value}" ${isSelected}>${label}</option>`;
};

const renderCategorySection = (categories = {}, selectedCategory1 = "", selectedCategory2 = "") => {
  const category1Keys = Object.keys(categories ?? {});

  if (category1Keys.length === 0) {
    return `
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">카테고리:</label>
        <span class="text-sm text-gray-500 italic">카테고리를 불러오는 중입니다...</span>
      </div>
    `;
  }

  const category1Buttons = category1Keys
    .map((category1) => {
      return `<button type="button" data-category1-btn="${category1}" class="${CATEGORY_BUTTON_CLASS}">${category1}</button>`;
    })
    .join("");

  let category2Markup = "";

  if (selectedCategory1) {
    const category2Keys = Object.keys(categories[selectedCategory1] ?? {});
    if (category2Keys.length > 0) {
      category2Markup = `
        <div class="flex flex-wrap gap-2">
          ${category2Keys
            .map((category2) => {
              return `<button type="button" data-category2-btn="${category2}" data-category1="${selectedCategory1}" class="${CATEGORY_BUTTON_CLASS}">
                ${category2}
              </button>`;
            })
            .join("")}
        </div>`;
    } else {
      category2Markup = `<div class="text-sm text-gray-500 italic">하위 카테고리가 없습니다.</div>`;
    }
  } else {
    category2Markup = `<div class="text-sm text-gray-500 italic">상위 카테고리를 먼저 선택해주세요.</div>`;
  }

  return `
    <div class="space-y-2">
      <div class="flex items-center gap-2 flex-wrap text-xs text-gray-600">
        <label class="text-sm text-gray-600 mr-2">카테고리:</label>
        <button type="button" data-category-reset class="text-xs hover:text-blue-700 hover:underline">전체</button>
        ${selectedCategory1 ? `<span class="text-xs text-gray-500">선택: ${selectedCategory1}${selectedCategory2 ? ` &gt; ${selectedCategory2}` : ""}</span>` : ""}
      </div>
      <div class="flex flex-wrap gap-2">
        ${category1Buttons}
      </div>
      ${category2Markup}
    </div>
  `;
};

export const SearchForm = ({
  limit = 20,
  sort = "price_asc",
  search = "",
  category1 = "",
  category2 = "",
  categories = {},
} = {}) => {
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
            value="${search}"
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
      <!-- 필터 옵션 -->
      <div class="space-y-3">
        <!-- 카테고리 필터 -->
        ${renderCategorySection(categories, category1, category2)}
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            <select
              id="limit-select"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              ${LIMIT_OPTIONS.map((option) => renderLimitOption(option, limit)).join("")}
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
              ${[
                { value: "price_asc", label: "가격 낮은순" },
                { value: "price_desc", label: "가격 높은순" },
                { value: "name_asc", label: "이름순" },
                { value: "name_desc", label: "이름 역순" },
              ]
                .map(({ value, label }) => renderSortOption(value, label, sort))
                .join("")}
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const bindSearchFormEvents = ({
  onLimitChange,
  onSortChange,
  onSearchSubmit,
  onCategory1Change,
  onCategory2Change,
  onCategoryReset,
  currentLimit = 20,
  currentSort = "price_asc",
  currentSearch = "",
} = {}) => {
  const limitSelect = document.getElementById("limit-select");
  const sortSelect = document.getElementById("sort-select");
  const searchInput = document.getElementById("search-input");
  const category1Buttons = document.querySelectorAll("[data-category1-btn]");
  const category2Buttons = document.querySelectorAll("[data-category2-btn]");
  const categoryResetButton = document.querySelector("[data-category-reset]");

  if (limitSelect) {
    limitSelect.value = String(currentLimit);
    limitSelect.onchange = (event) => {
      const selectedLimit = Number(event.target.value);

      if (Number.isNaN(selectedLimit)) {
        return;
      }

      if (typeof onLimitChange === "function") {
        onLimitChange(selectedLimit);
      }
    };
  }

  if (sortSelect) {
    sortSelect.value = currentSort;
    sortSelect.onchange = (event) => {
      const nextSort = event.target.value;

      if (typeof onSortChange === "function") {
        onSortChange(nextSort);
      }
    };
  }

  if (searchInput) {
    searchInput.value = currentSearch;
    searchInput.onkeydown = (event) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();

      if (typeof onSearchSubmit === "function") {
        onSearchSubmit(event.target.value.trim());
      }
    };
  }

  if (category1Buttons.length > 0) {
    category1Buttons.forEach((button) => {
      button.onclick = () => {
        const nextCategory1 = button.getAttribute("data-category1-btn") ?? "";
        if (typeof onCategory1Change === "function") {
          onCategory1Change(nextCategory1);
        }
      };
    });
  }

  if (category2Buttons.length > 0) {
    category2Buttons.forEach((button) => {
      button.onclick = () => {
        const nextCategory2 = button.getAttribute("data-category2-btn") ?? "";
        const nextCategory1 = button.getAttribute("data-category1") ?? "";
        if (typeof onCategory2Change === "function") {
          onCategory2Change(nextCategory1, nextCategory2);
        }
      };
    });
  }

  if (categoryResetButton) {
    categoryResetButton.onclick = () => {
      if (typeof onCategoryReset === "function") {
        onCategoryReset();
      }
    };
  }
};
