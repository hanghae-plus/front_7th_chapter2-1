import { setupEventDelegation } from "./utils/eventDelegation.js";
import {
  applyLimitFilter,
  applySortFilter,
  applySearchFilter,
  applyCategory1Filter,
  applyCategory2Filter,
  handleBreadcrumbAction,
} from "./actions/filterActions.js";
import { handleProductClick } from "./actions/productActions.js";
import { handleAddToCartClick } from "./actions/productActions.js";
import { setUpInfiniteScroll } from "./infiniteScroll.js";

let cleanupFunctions = [];

/**
 * HomePage 이벤트 위임 설정
 */
export function setupHomePageDelegation() {
  // 기존 리스너 제거
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions = [];

  // Click 이벤트 위임
  const clickHandlers = {
    // 필터: 카테고리
    "filter-category1": (event, element) => {
      const category1 = element.dataset.category1;
      if (category1) {
        applyCategory1Filter(category1);
      }
    },
    "filter-category2": (event, element) => {
      const category2 = element.dataset.category2;
      if (category2) {
        applyCategory2Filter(category2);
      }
    },
    // 브레드크럼
    breadcrumb: (event, element) => {
      const action = element.dataset.breadcrumb;
      if (action) {
        handleBreadcrumbAction(action);
      }
    },
    // 상품 클릭
    "product-click": (event, element) => {
      handleProductClick(element);
    },
    // 장바구니 추가
    "add-to-cart": (event, element) => {
      event.stopPropagation(); // 상품 클릭 이벤트 전파 방지
      handleAddToCartClick(element);
    },
  };

  // Change 이벤트 위임 (select 요소)
  const changeHandlers = {
    "filter-limit": (event, element) => {
      const limit = element.value;
      if (limit) {
        applyLimitFilter(limit);
      }
    },
    "filter-sort": (event, element) => {
      const sort = element.value;
      if (sort) {
        applySortFilter(sort);
      }
    },
  };

  // Keydown 이벤트 위임 (검색 입력)
  const keydownHandlers = {
    "filter-search": (event, element) => {
      if (event.key === "Enter") {
        const searchValue = element.value;
        applySearchFilter(searchValue);
      }
    },
  };

  // 이벤트 위임 설정
  cleanupFunctions.push(setupEventDelegation("click", clickHandlers));
  cleanupFunctions.push(setupEventDelegation("change", changeHandlers));
  cleanupFunctions.push(setupEventDelegation("keydown", keydownHandlers));

  // 무한 스크롤 설정
  setUpInfiniteScroll();
}

/**
 * HomePage 이벤트 위임 제거
 */
export function cleanupHomePageDelegation() {
  cleanupFunctions.forEach((cleanup) => cleanup());
  cleanupFunctions = [];
}
