import { getCategories } from "@/api/productApi";
import { Component } from "@/core/Component";

const PAGE_SIZE = [10, 20, 50, 100];
const SORT = [
  { label: "가격 낮은순", value: "price_asc" },
  { label: "가격 높은순", value: "price_desc" },
  { label: "이름순", value: "name_asc" },
  { label: "이름 역순", value: "name_desc" },
];

const Search = Component({
  template: (context) => {
    const { props, state } = context;
    const { filters, pagination } = props;
    const { loading, categories } = state;

    // 현재 표시할 카테고리 목록
    const getCategoriesToDisplay = () => {
      if (loading) return [];

      // 2depth가 선택되었거나 1depth만 선택된 경우: 해당 1depth의 2depth 목록
      if (filters.category1) {
        return Object.keys(categories[filters.category1] || {});
      }

      // 아무것도 선택 안된 경우: 1depth 목록
      return Object.keys(categories);
    };

    const categoriesToDisplay = getCategoriesToDisplay();

    return /* HTML */ `
      <!-- 검색창 -->
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            id="search-input"
            placeholder="상품명을 검색해보세요..."
            value="${filters.search || ""}"
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
        <div class="space-y-2">
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">카테고리:</label>
            <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
            ${filters.category1
              ? /* HTML */ `
                  <span class="text-xs text-gray-500">&gt;</span>
                  <button data-breadcrumb="category1" class="text-xs hover:text-blue-800 hover:underline">
                    ${filters.category1}
                  </button>
                `
              : ""}
            ${filters.category2
              ? /* HTML */ `
                  <span class="text-xs text-gray-500">&gt;</span>
                  <span class="text-xs text-gray-600 cursor-default">${filters.category2}</span>
                `
              : ""}
          </div>
          <!-- 카테고리 버튼들 -->
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              ${loading
                ? /* HTML */ `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`
                : categoriesToDisplay
                    .map((category) => {
                      // 1depth인지 2depth인지 판단
                      const isCategory1 = !filters.category1;
                      const isSelected = isCategory1 ? category === filters.category1 : category === filters.category2;

                      return /* HTML */ `<button
                        data-category1="${isCategory1 ? category : filters.category1}"
                        data-category2="${isCategory1 ? "" : category}"
                        class="category-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                          ${isSelected
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                      >
                        ${category}
                      </button>`;
                    })
                    .join("")}
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
                ${PAGE_SIZE.map(
                  (pageSize) =>
                    /* HTML */
                    `<option value="${pageSize}" ${pagination.limit === pageSize ? "selected" : ""}>
                      ${pageSize}개
                    </option>`,
                ).join("")}
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
                ${SORT.map(
                  (sort) =>
                    /* HTML */
                    `<option value="${sort.value}" ${filters.sort === sort.value ? "selected" : ""}>
                      ${sort.label}
                    </option>`,
                ).join("")}
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initialState: () => ({
    categories: {},
    loading: true,
  }),

  setEvent: (context) => {
    const { props, addEvent } = context;
    const { onChangePageLimit, onChangeSort, onChangeSearch, onChangeCategory } = props;

    // 페이지당 개수 변경
    addEvent("#limit-select", "change", (e) => {
      onChangePageLimit(Number(e.target.value));
    });

    // 정렬 변경
    addEvent("#sort-select", "change", (e) => {
      onChangeSort(e.target.value);
    });

    // 검색어 변경
    addEvent("#search-input", "change", (e) => {
      onChangeSearch(e.target.value);
    });

    // 카테고리 버튼 클릭 (이벤트 위임)
    addEvent(".category-filter-btn", "click", (e, target) => {
      const category1 = target.dataset.category1;
      const category2 = target.dataset.category2;
      onChangeCategory(category1, category2);
    });

    // Breadcrumb 클릭
    addEvent("[data-breadcrumb]", "click", (e, target) => {
      const type = target.dataset.breadcrumb;

      if (type === "reset") {
        // 전체 클릭: 모든 카테고리 필터 제거
        onChangeCategory("", "");
      } else if (type === "category1") {
        // category1 클릭: category2만 제거 (1depth 유지)
        onChangeCategory(props.filters.category1, "");
      }
      // category2 클릭: 변경 없음 (아무것도 하지 않음)
    });
  },

  setup: async (context) => {
    const { setState } = context;

    // 카테고리 데이터 가져오기
    const fetchCategories = async () => {
      setState({ loading: true });
      const categories = await getCategories();
      setState({ categories, loading: false });
    };

    await fetchCategories();
  },
});

export default Search;
