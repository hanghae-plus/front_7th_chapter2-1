import { getCategories } from "../api/productApi.js";
import { state } from "../state/appState.js";
import { updateHomeUrlParams } from "./urlService.js";

/**
 * 카테고리 정보를 로드합니다.
 * @param {Function} onRender - 렌더링 콜백
 * @param {Function} onShowToast - 토스트 표시 콜백
 */
export async function ensureCategoriesLoaded(onRender, onShowToast) {
  // 이미 카테고리가 로드되었으면 다시 로드하지 않음
  if (state.categoriesLoaded) {
    state.isLoadingCategories = false;
    return;
  }

  // 이미 로딩 중이고 categories에 데이터가 있으면 중복 호출 방지
  // 초기 상태에서는 isLoadingCategories가 true이고 categories가 비어있으므로 로드 진행
  if (state.isLoadingCategories && Object.keys(state.categories).length > 0) {
    return;
  }

  // 로딩 상태로 설정 (초기값이 이미 true일 수 있음)
  // 초기 렌더링에서 이미 render()가 호출되어 "카테고리 로딩 중..."이 표시됨
  state.isLoadingCategories = true;

  try {
    const categories = await getCategories();
    state.categories = categories ?? {};
    state.categoriesLoaded = true;
  } catch (error) {
    console.error("카테고리 정보를 불러오지 못했습니다.", error);
    state.categories = {};
    state.categoriesLoaded = false;
    if (onShowToast) {
      onShowToast();
    }
  } finally {
    state.isLoadingCategories = false;
    // 카테고리 로드 완료 후 UI 업데이트
    if (state.route?.name === "home" && onRender) {
      onRender();
    }
  }
}

/**
 * 카테고리1을 선택합니다.
 * @param {string} category1 - 카테고리1
 * @param {Function} onUpdateUI - UI 업데이트 콜백
 * @param {Function} onLoadProducts - 상품 로딩 콜백
 */
export function handleCategory1Select(category1, onUpdateUI, onLoadProducts) {
  const changed = state.selectedCategory1 !== category1 || state.selectedCategory2 !== null;

  if (changed) {
    // 카테고리 변경 시 기존 로딩 상태를 리셋하여 새로운 API 호출이 보장되도록 함
    state.isLoadingProducts = false;
    state.isLoadingMore = false;
    state.productsError = null;
    state.loadMoreError = null;
    state.products = [];
    state.totalProducts = 0;
    state.currentPage = 0;

    state.selectedCategory1 = category1;
    state.selectedCategory2 = null;
    state.urlTouched = true;

    // 브레드크럼과 카테고리 버튼을 즉시 업데이트
    if (onUpdateUI) {
      onUpdateUI();
    }

    // 새로운 카테고리로 API 호출
    if (onLoadProducts) {
      onLoadProducts();
    }
  } else {
    if (onUpdateUI) {
      onUpdateUI();
    }
  }
}

/**
 * 카테고리2를 선택합니다.
 * @param {string} category1 - 카테고리1
 * @param {string} category2 - 카테고리2
 * @param {Function} onUpdateUI - UI 업데이트 콜백
 * @param {Function} onLoadProducts - 상품 로딩 콜백
 */
export function handleCategory2Select(category1, category2, onUpdateUI, onLoadProducts) {
  const changed = state.selectedCategory1 !== category1 || state.selectedCategory2 !== category2;

  if (changed) {
    // 카테고리 변경 시 기존 로딩 상태를 리셋하여 새로운 API 호출이 보장되도록 함
    state.isLoadingProducts = false;
    state.isLoadingMore = false;
    state.productsError = null;
    state.loadMoreError = null;
    state.products = [];
    state.totalProducts = 0;
    state.currentPage = 0;

    state.selectedCategory1 = category1;
    state.selectedCategory2 = category2;
    state.urlTouched = true;

    // 브레드크럼과 카테고리 버튼을 즉시 업데이트
    if (onUpdateUI) {
      onUpdateUI();
    }

    // 새로운 카테고리로 API 호출
    if (onLoadProducts) {
      onLoadProducts();
    }
  } else {
    if (onUpdateUI) {
      onUpdateUI();
    }
  }
}

/**
 * 카테고리를 리셋합니다.
 * @param {Function} onUpdateUI - UI 업데이트 콜백
 * @param {Function} onLoadProducts - 상품 로딩 콜백
 */
export function handleCategoryReset(onUpdateUI, onLoadProducts) {
  const changed = state.selectedCategory1 !== null || state.selectedCategory2 !== null || state.searchTerm !== "";
  if (!changed) {
    if (onUpdateUI) {
      onUpdateUI();
    }
    return;
  }

  state.selectedCategory1 = null;
  state.selectedCategory2 = null;
  state.searchTerm = "";
  state.currentPage = 0;
  state.urlTouched = true;
  updateHomeUrlParams({ current: 1, category1: null, category2: null, search: null });
  if (onLoadProducts) {
    onLoadProducts();
  }
}

/**
 * 카테고리 브레드크럼을 처리합니다.
 * @param {string} category1 - 카테고리1
 * @param {Function} onUpdateUI - UI 업데이트 콜백
 * @param {Function} onLoadProducts - 상품 로딩 콜백
 */
export function handleCategoryBreadcrumb(category1, onUpdateUI, onLoadProducts) {
  const targetCategory = category1 || null;
  const changed =
    state.selectedCategory1 !== targetCategory || state.selectedCategory2 !== null || state.searchTerm !== "";

  state.selectedCategory1 = targetCategory;
  state.selectedCategory2 = null;

  if (changed) {
    state.urlTouched = true;
    updateHomeUrlParams({ current: 1, category1: targetCategory, category2: null, search: state.searchTerm });
    if (onLoadProducts) {
      onLoadProducts();
    }
  } else {
    if (onUpdateUI) {
      onUpdateUI();
    }
  }
}
