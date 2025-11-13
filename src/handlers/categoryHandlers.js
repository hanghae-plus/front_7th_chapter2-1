import { state } from "../state/appState.js";
import {
  handleCategory1Select as handleCategory1SelectService,
  handleCategory2Select as handleCategory2SelectService,
  handleCategoryReset as handleCategoryResetService,
  handleCategoryBreadcrumb as handleCategoryBreadcrumbService,
} from "../services/categoryService.js";

/**
 * 카테고리 브레드크럼 클릭 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onCategoryReset - 카테고리 리셋 핸들러
 * @param {Function} onCategoryBreadcrumb - 카테고리 브레드크럼 핸들러
 */
export function handleCategoryBreadcrumbClick(event, onCategoryReset, onCategoryBreadcrumb) {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  if (target.dataset.breadcrumb === "reset") {
    if (onCategoryReset) {
      onCategoryReset(event);
    }
    return;
  }

  if (target.dataset.breadcrumb === "category1") {
    if (onCategoryBreadcrumb) {
      onCategoryBreadcrumb(event);
    }
    return;
  }
}

/**
 * 카테고리 버튼 클릭 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onCategory1Select - 카테고리1 선택 핸들러
 * @param {Function} onCategory2Select - 카테고리2 선택 핸들러
 */
export function handleCategoryButtonsClick(event, onCategory1Select, onCategory2Select) {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  if (target.dataset.category2) {
    if (onCategory2Select) {
      onCategory2Select(event);
    }
    return;
  }

  if (target.dataset.category1) {
    if (onCategory1Select) {
      onCategory1Select(event);
    }
  }
}

/**
 * 카테고리1 선택 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onUpdateUI - UI 업데이트 함수
 * @param {Function} onLoadProducts - 상품 로딩 함수
 */
export function handleCategory1Select(event, onUpdateUI, onLoadProducts) {
  event.preventDefault();
  const button = event.target.closest("[data-category1]");
  if (!button) {
    return;
  }
  const { category1 } = button.dataset;
  if (!category1) {
    return;
  }

  handleCategory1SelectService(category1, onUpdateUI, onLoadProducts);
}

/**
 * 카테고리2 선택 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onUpdateUI - UI 업데이트 함수
 * @param {Function} onLoadProducts - 상품 로딩 함수
 */
export function handleCategory2Select(event, onUpdateUI, onLoadProducts) {
  event.preventDefault();
  const button = event.target.closest("[data-category2]");
  if (!button) {
    return;
  }
  const { category1, category2 } = button.dataset;
  if (!category1 || !category2) {
    return;
  }

  handleCategory2SelectService(category1, category2, onUpdateUI, onLoadProducts);
}

/**
 * 카테고리 리셋 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onUpdateUI - UI 업데이트 함수
 * @param {Function} onLoadProducts - 상품 로딩 함수
 */
export function handleCategoryReset(event, onUpdateUI, onLoadProducts) {
  event.preventDefault();
  const button = event.target.closest('[data-breadcrumb="reset"]');
  if (!button) {
    return;
  }

  handleCategoryResetService(onUpdateUI, onLoadProducts);
}

/**
 * 카테고리 브레드크럼 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onUpdateUI - UI 업데이트 함수
 * @param {Function} onLoadProducts - 상품 로딩 함수
 */
export function handleCategoryBreadcrumb(event, onUpdateUI, onLoadProducts) {
  event.preventDefault();
  const button = event.target.closest('[data-breadcrumb="category1"]');
  if (!button) {
    return;
  }

  const { category1 } = button.dataset;
  handleCategoryBreadcrumbService(category1, onUpdateUI, onLoadProducts);
}

/**
 * 검색 입력 키다운 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onLoadProducts - 상품 로딩 함수
 * @param {Function} updateHomeUrlParams - URL 파라미터 업데이트 함수
 */
export function handleSearchInputKeyDown(event, onLoadProducts, updateHomeUrlParams) {
  if (event.key !== "Enter") {
    return;
  }
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) {
    return;
  }
  event.preventDefault();
  const nextTerm = input.value.trim();
  if (state.searchTerm === nextTerm) {
    return;
  }
  state.searchTerm = nextTerm;
  state.urlTouched = true;
  if (updateHomeUrlParams) {
    updateHomeUrlParams({
      current: 1,
      category1: state.selectedCategory1,
      category2: state.selectedCategory2,
      search: nextTerm || null,
    });
  }
  if (onLoadProducts) {
    onLoadProducts();
  }
}
