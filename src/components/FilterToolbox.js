import createComponent from "../core/component/create-component";
import { LIMIT_OPTIONS } from "../constants/filter-constant";
import { SORT_OPTIONS } from "../constants/filter-constant";
import CategoryFilter from "./CategoryFilter";

const FilterToolbox = createComponent({
  id: "filter-toolbox",
  props: {
    categories: [],
    limit: 20,
    sort: "price_asc",
    search: "",
    selectedCategory1: "",
    selectedCategory2: "",
    handleSetSort: () => {},
    handleSetLimit: () => {},
    handleSetSearch: () => {},
    handleSetSelectedCategory1: () => {},
    handleSetSelectedCategory2: () => {},
  },
  //   initialState: (props) => ({
  //     filters: props.filters || {},
  //     pagination: props.pagination || {},
  //     selectedCategory1: props.filters?.category1 || "",
  //     selectedCategory2: props.filters?.category2 || "",
  //     categories: props.categories || [],
  //     searchKeyword: props.filters?.search || "",
  //   }),
  eventHandlers: {
    "search-input": (props, getter, setter, event) => {
      if (!event.target) return;
      if (event.key === "Enter") {
        const value = event.target.value;
        props.handleSetSearch(value);
      }
    },
    "sort-select": (props, getter, setter, event) => {
      const value = event.target.value;
      props.handleSetSort(value);
    },
    "limit-select": (props, getter, setter, event) => {
      const value = parseInt(event.target.value);
      props.handleSetLimit(value);
    },
  },
  templateFn: (props) => {
    console.log("[Template] props", props);
    return /* HTML */ `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <!-- 검색창 -->
        <div class="mb-4">
          <div class="relative">
            <input
              type="text"
              id="search-input"
              data-event="search-input"
              data-event-type="keydown"
              placeholder="상품명을 검색해보세요..."
              value="${props.search}"
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
          ${CategoryFilter.mount({
            categories: props.categories,
            selectedCategory1: props.selectedCategory1,
            selectedCategory2: props.selectedCategory2,
            handleSetSelectedCategory1: props.handleSetSelectedCategory1,
            handleSetSelectedCategory2: props.handleSetSelectedCategory2,
          }).outerHTML}
          <!-- 기존 필터들 -->
          <div class="flex gap-2 items-center justify-between">
            <!-- 페이지당 상품 수 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">개수:</label>
              <select
                id="limit-select"
                data-event="limit-select"
                data-event-type="change"
                class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                ${LIMIT_OPTIONS.map(
                  (limit) => /* HTML */ `
                    <option value="${limit}" ${limit === props.limit ? "selected" : ""}>${limit}개</option>
                  `,
                ).join("\n")}
              </select>
            </div>
            <!-- 정렬 -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">정렬:</label>
              <select
                id="sort-select"
                data-event="sort-select"
                data-event-type="change"
                class="text-sm border border-gray-300 rounded px-2 py-1
                        focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                ${SORT_OPTIONS.map(
                  (sort) => /* HTML */ `
                    <option value="${sort.value}" ${sort.value === props.sort ? "selected" : ""}>${sort.label}</option>
                  `,
                ).join("\n")}
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

export default FilterToolbox;
