import { getCategories } from "../../api/productApi";
import { renderProducts } from "../../utils/productRenderer";
import { getCurrentFilters, updateFilters } from "../../utils/filterState";
import { initSearchInput } from "../../utils/searchHandler";

export const ProductFilter = () => {
  // 카테고리 데이터를 전역으로 저장
  let categoriesData = {};

  // Breadcrumb 업데이트 함수
  const updateBreadcrumb = () => {
    const currentFilters = getCurrentFilters();
    const breadcrumbContainer = document.querySelector("[data-breadcrumb-container]");

    if (!breadcrumbContainer) return;

    let breadcrumbHTML =
      '<button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>';

    if (currentFilters.category1) {
      breadcrumbHTML += ` <span class="text-xs text-gray-400">></span> <button data-breadcrumb="category1" class="text-xs hover:text-blue-800 hover:underline">${currentFilters.category1}</button>`;
    }

    if (currentFilters.category2) {
      breadcrumbHTML += ` <span class="text-xs text-gray-400">></span> <span class="text-xs text-gray-600">${currentFilters.category2}</span>`;
    }

    breadcrumbContainer.innerHTML = breadcrumbHTML;
  };

  // category1 목록 렌더링
  const renderCategory1List = () => {
    const categoryContainer = document.getElementById("category-filter-container");
    if (!categoryContainer) return;

    const categoryButtons = Object.keys(categoriesData)
      .map(
        (category) => `
        <button data-category1="${category}"
                class="category1-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors
                       bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
          ${category}
        </button>
      `,
      )
      .join("");

    categoryContainer.innerHTML = categoryButtons;
  };

  // category2 목록 렌더링
  const renderCategory2List = (category1) => {
    const categoryContainer = document.getElementById("category-filter-container");
    if (!categoryContainer) return;

    const category2List = categoriesData[category1];
    if (!category2List || Object.keys(category2List).length === 0) {
      categoryContainer.innerHTML = '<div class="text-sm text-gray-500 italic">하위 카테고리가 없습니다.</div>';
      return;
    }

    const currentFilters = getCurrentFilters();
    const selectedCategory2 = currentFilters.category2;

    const category2Buttons = Object.keys(category2List)
      .map((category) => {
        const isSelected = category === selectedCategory2;
        const activeClass = isSelected
          ? "bg-blue-100 border-blue-500 text-blue-700"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";

        return `
            <button data-category2="${category}"
                    class="category2-filter-btn text-left px-3 py-2 text-sm rounded-md border transition-colors ${activeClass}">
              ${category}
            </button>
          `;
      })
      .join("");

    categoryContainer.innerHTML = category2Buttons;
  };

  // category1 클릭 핸들러
  const handleClickCategory1 = (category) => {
    // category1 설정, category2 초기화
    const updatedFilters = updateFilters({ category1: category, category2: "" });

    // Breadcrumb 업데이트
    updateBreadcrumb();

    // category2 목록 렌더링
    renderCategory2List(category);

    // 상품 목록 업데이트
    renderProducts({ params: updatedFilters });
  };

  // category2 클릭 핸들러
  const handleClickCategory2 = (category) => {
    const currentFilters = getCurrentFilters();

    // category2만 업데이트 (category1 유지)
    const updatedFilters = updateFilters({ category2: category });

    // Breadcrumb 업데이트
    updateBreadcrumb();

    // category2 목록 다시 렌더링 (선택 상태 반영)
    renderCategory2List(currentFilters.category1);

    // 상품 목록 업데이트
    renderProducts({ params: updatedFilters });
  };

  // 전체 리셋 핸들러
  const handleResetAll = () => {
    // 카테고리 필터 초기화
    const updatedFilters = updateFilters({ category1: "", category2: "" });

    // Breadcrumb 업데이트
    updateBreadcrumb();

    // category1 목록 다시 렌더링
    renderCategory1List();

    // 상품 목록 업데이트
    renderProducts({ params: updatedFilters });
  };

  // category1로 돌아가기 핸들러
  const handleBackToCategory1 = () => {
    const currentFilters = getCurrentFilters();

    // category2 초기화
    const updatedFilters = updateFilters({ category2: "" });

    // Breadcrumb 업데이트
    updateBreadcrumb();

    // category2 목록 다시 렌더링 (현재 category1 기준)
    renderCategory2List(currentFilters.category1);

    // 상품 목록 업데이트
    renderProducts({ params: updatedFilters });
  };

  const handleClickLimit = (limit) => {
    const updatedFilters = updateFilters({ limit: parseInt(limit) });
    renderProducts({ params: updatedFilters });
  };

  const handleClickSort = (sort) => {
    const updatedFilters = updateFilters({ sort });
    renderProducts({ params: updatedFilters });
  };

  setTimeout(() => {
    // 검색 입력 필드 초기화
    initSearchInput();

    getCategories().then((categories) => {
      // 카테고리 데이터 저장
      categoriesData = categories;

      const categoryContainer = document.getElementById("category-filter-container");
      const breadcrumbContainer = document.querySelector("[data-breadcrumb-container]");
      const limitSelect = document.getElementById("limit-select");
      const sortSelect = document.getElementById("sort-select");

      // URL에서 현재 필터 상태 가져오기
      const currentFilters = getCurrentFilters();

      // Breadcrumb 초기화
      updateBreadcrumb();

      // limit, sort select 값 복원
      if (limitSelect) {
        limitSelect.value = currentFilters.limit;
      }
      if (sortSelect) {
        sortSelect.value = currentFilters.sort;
      }

      // Breadcrumb 이벤트 위임
      if (breadcrumbContainer) {
        breadcrumbContainer.addEventListener("click", (e) => {
          const resetBtn = e.target.closest('[data-breadcrumb="reset"]');
          const category1Btn = e.target.closest('[data-breadcrumb="category1"]');

          if (resetBtn) {
            handleResetAll();
          } else if (category1Btn) {
            handleBackToCategory1();
          }
        });
      }

      // 카테고리 컨테이너 이벤트 위임
      if (categoryContainer) {
        if (Object.keys(categories).length === 0) {
          categoryContainer.innerHTML = '<div class="text-sm text-gray-500 italic">카테고리가 없습니다.</div>';
        } else {
          // URL 상태에 따라 적절한 카테고리 렌더링
          if (currentFilters.category1 && currentFilters.category2) {
            // category1과 category2가 모두 선택된 경우 category2 목록 렌더링
            renderCategory2List(currentFilters.category1);
          } else if (currentFilters.category1) {
            // category1만 선택된 경우 category2 목록 렌더링
            renderCategory2List(currentFilters.category1);
          } else {
            // 초기 상태: category1 목록 렌더링
            renderCategory1List();
          }

          // 이벤트 위임으로 category1, category2 클릭 처리
          categoryContainer.addEventListener("click", (e) => {
            const category1Btn = e.target.closest(".category1-filter-btn");
            const category2Btn = e.target.closest(".category2-filter-btn");

            if (category1Btn) {
              const category = category1Btn.dataset.category1;
              handleClickCategory1(category);
            } else if (category2Btn) {
              const category = category2Btn.dataset.category2;
              handleClickCategory2(category);
            }
          });
        }
      }

      if (limitSelect) {
        limitSelect.addEventListener("change", (e) => {
          const value = e.target.value;
          handleClickLimit(value);
        });
      }

      if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
          const value = e.target.value;
          handleClickSort(value);
        });
      }
    });
  }, 0);

  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <!-- 검색창 -->
      <div class="mb-4">
        <div class="relative">
          <input type="text" id="search-input" placeholder="상품명을 검색해보세요..." value="" class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
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
            <div data-breadcrumb-container class="flex items-center gap-2">
              <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
            </div>
          </div>
          <!-- 카테고리 버튼 컨테이너 (동적으로 category1 또는 category2 표시) -->
          <div id="category-filter-container" class="flex flex-wrap gap-2">
            <div class="text-sm text-gray-500 italic">카테고리 로딩 중...</div>
          </div>
        </div>
        <!-- 기존 필터들 -->
        <div class="flex gap-2 items-center justify-between">
          <!-- 페이지당 상품 수 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">개수:</label>
            <select id="limit-select"
                    class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="10">
                10개
              </option>
              <option value="20" selected="">
                20개
              </option>
              <option value="50">
                50개
              </option>
              <option value="100">
                100개
              </option>
            </select>
          </div>
          <!-- 정렬 -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">정렬:</label>
            <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                          focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="price_asc" selected="">가격 낮은순</option>
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
