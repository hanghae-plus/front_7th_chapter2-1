import { getCategories } from "../api/productApi";
import { store } from "../store/Store";

// URL 쿼리 스트링 업데이트 함수
const updateURLParams = (params) => {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState({}, "", url);
};

// URL 쿼리 스트링에서 값 가져오기 함수
const getURLParam = (key) => {
  const url = new URL(window.location);
  return url.searchParams.get(key) || "";
};

const ProductSearchFilter = (targetNode) => {
  const registerStore = () => {
    store.subscribe("isCategoryLoading", onUpdate);
    store.setState("isCategoryLoading", true);
    store.subscribe("categoryListData", onUpdate);
    store.setState("categoryListData", null);
    store.subscribe("selectedCategory1", onUpdate);
    store.subscribe("selectedCategory2", onUpdate);
    store.subscribe("selectedLimit", onUpdate);
    store.subscribe("selectedSort", onUpdate);

    // URL 쿼리 스트링에서 초기값 설정
    const category1FromURL = getURLParam("category1");
    const category2FromURL = getURLParam("category2");
    const limitFromURL = getURLParam("limit") || "20";
    const sortFromURL = getURLParam("sort") || "price_asc";
    store.setState("selectedCategory1", category1FromURL);
    store.setState("selectedCategory2", category2FromURL);
    store.setState("selectedLimit", limitFromURL);
    store.setState("selectedSort", sortFromURL);
  };

  const render = () => {
    const isCategoryLoading = store.getState("isCategoryLoading");
    const categoryListData = store.getState("categoryListData");
    const selectedCategory1 = store.getState("selectedCategory1");
    const selectedCategory2 = store.getState("selectedCategory2");
    const selectedLimit = store.getState("selectedLimit") || "20";
    const selectedSort = store.getState("selectedSort") || "price_asc";

    targetNode.innerHTML = /* HTML */ `
      <!-- 검색창 -->
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            id="search-input"
            placeholder="상품명을 검색해보세요..."
            value=""
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
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">카테고리:</label>
            <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
            ${selectedCategory1
              ? /* HTML */ `<span class="text-xs text-gray-500">&gt;</span>
                  <button
                    data-breadcrumb="category1"
                    data-category1="${selectedCategory1}"
                    class="text-xs hover:text-blue-800 hover:underline"
                  >
                    ${selectedCategory1}
                  </button>`
              : ""}
            ${selectedCategory2
              ? /* HTML */ `<span class="text-xs text-gray-500">&gt;</span>
                  <span class="text-xs text-gray-600 cursor-default">${selectedCategory2}</span>`
              : ""}
          </div>
          ${isCategoryLoading
            ? /* HTML */ `<div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>`
            : !selectedCategory1
              ? /* HTML */ `
                  <!-- 1depth 카테고리 -->
                  <div class="flex flex-wrap gap-2">
                    ${categoryListData
                      ? Object.keys(categoryListData)
                          .map(
                            (category1) => /* HTML */ `
                              <button
                                data-category1="${category1}"
                                class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                        bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                ${category1}
                              </button>
                            `,
                          )
                          .join("")
                      : ""}
                  </div>
                `
              : /* HTML */ `
                  <!-- 2depth 카테고리 -->
                  <div class="flex flex-wrap gap-2">
                    ${categoryListData?.[selectedCategory1]
                      ? Object.keys(categoryListData[selectedCategory1])
                          .map(
                            (category2) => /* HTML */ `
                              <button
                                data-category1="${selectedCategory1}"
                                data-category2="${category2}"
                                class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                        ${selectedCategory2 === category2
                                  ? "bg-blue-100 border-blue-300 text-blue-800"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}"
                              >
                                ${category2}
                              </button>
                            `,
                          )
                          .join("")
                      : ""}
                  </div>
                `}
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
              <option value="10" ${selectedLimit === "10" ? "selected" : ""}>10개</option>
              <option value="20" ${selectedLimit === "20" ? "selected" : ""}>20개</option>
              <option value="50" ${selectedLimit === "50" ? "selected" : ""}>50개</option>
              <option value="100" ${selectedLimit === "100" ? "selected" : ""}>100개</option>
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
              <option value="price_asc" ${selectedSort === "price_asc" ? "selected" : ""}>가격 낮은순</option>
              <option value="price_desc" ${selectedSort === "price_desc" ? "selected" : ""}>가격 높은순</option>
              <option value="name_asc" ${selectedSort === "name_asc" ? "selected" : ""}>이름순</option>
              <option value="name_desc" ${selectedSort === "name_desc" ? "selected" : ""}>이름 역순</option>
            </select>
          </div>
        </div>
      </div>
    `;
  };

  const onUpdate = () => {
    render();
    addEventListeners();
  };

  const addEventListeners = () => {
    // 카테고리1 버튼 클릭
    const category1Buttons = targetNode.querySelectorAll(".category1-filter-btn");
    category1Buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const category1 = button.dataset.category1;
        // 카테고리1 선택 시 카테고리2 초기화
        store.setState("selectedCategory1", category1);
        store.setState("selectedCategory2", "");
        // URL 업데이트
        updateURLParams({ category1, category2: "" });
      });
    });

    // 카테고리2 버튼 클릭
    const category2Buttons = targetNode.querySelectorAll(".category2-filter-btn");
    category2Buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const category2 = button.dataset.category2;
        const currentCategory2 = store.getState("selectedCategory2");
        const category1 = store.getState("selectedCategory1");

        if (currentCategory2 === category2) {
          // 같은 카테고리를 다시 클릭하면 선택 해제
          store.setState("selectedCategory2", "");
          updateURLParams({ category1, category2: "" });
        } else {
          // 새로운 카테고리 선택
          store.setState("selectedCategory2", category2);
          updateURLParams({ category1, category2 });
        }
      });
    });

    // 전체 버튼 클릭 (카테고리 초기화)
    const resetButton = targetNode.querySelector('[data-breadcrumb="reset"]');
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        store.setState("selectedCategory1", "");
        store.setState("selectedCategory2", "");
        // URL 업데이트
        updateURLParams({ category1: "", category2: "" });
      });
    }

    // breadcrumb category1 버튼 클릭 (카테고리2만 초기화)
    const breadcrumbCategory1Button = targetNode.querySelector('[data-breadcrumb="category1"]');
    if (breadcrumbCategory1Button) {
      breadcrumbCategory1Button.addEventListener("click", () => {
        const category1 = store.getState("selectedCategory1");
        store.setState("selectedCategory2", "");
        // URL 업데이트
        updateURLParams({ category1, category2: "" });
      });
    }

    // limit select 변경
    const limitSelect = targetNode.querySelector("#limit-select");
    if (limitSelect) {
      limitSelect.addEventListener("change", (e) => {
        const limit = e.target.value;
        store.setState("selectedLimit", limit);
        // URL 업데이트
        const category1 = store.getState("selectedCategory1");
        const category2 = store.getState("selectedCategory2");
        const sort = store.getState("selectedSort");
        updateURLParams({ category1, category2, limit, sort });
      });
    }

    // sort select 변경
    const sortSelect = targetNode.querySelector("#sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        const sort = e.target.value;
        store.setState("selectedSort", sort);
        // URL 업데이트
        const category1 = store.getState("selectedCategory1");
        const category2 = store.getState("selectedCategory2");
        const limit = store.getState("selectedLimit");
        updateURLParams({ category1, category2, limit, sort });
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      store.setState("categoryListData", data);
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
    } finally {
      store.setState("isCategoryLoading", false);
    }
  };

  const didMount = () => {
    addEventListeners();
    fetchCategories();
  };

  const onMount = () => {
    registerStore();
    render();
    didMount();
  };

  onMount();
};

export default ProductSearchFilter;
