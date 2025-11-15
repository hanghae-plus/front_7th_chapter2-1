import { navigateWithParams } from "../utils/urlHelpers.js";

/**
 * 필터 적용
 * @param {string} filterType - 필터 타입 (limit, sort, search, category1, category2)
 * @param {string} value - 필터 값
 * @param {Object} options - 추가 옵션
 */
export function applyFilter(filterType, value, options = {}) {
  const updates = { [filterType]: value };

  // category1 변경 시 category2 초기화
  if (filterType === "category1") {
    updates.category2 = null;
  }

  navigateWithParams(updates, options.resetPage !== false);
}

/**
 * 검색 필터 적용
 * @param {string} searchValue - 검색어
 */
export function applySearchFilter(searchValue) {
  applyFilter("search", searchValue);
}

/**
 * 정렬 필터 적용
 * @param {string} sortValue - 정렬 값
 */
export function applySortFilter(sortValue) {
  applyFilter("sort", sortValue);
}

/**
 * 개수 제한 필터 적용
 * @param {string} limitValue - 개수 제한 값
 */
export function applyLimitFilter(limitValue) {
  applyFilter("limit", limitValue);
}

/**
 * 카테고리1 필터 적용
 * @param {string} category1 - 카테고리1 값
 */
export function applyCategory1Filter(category1) {
  applyFilter("category1", category1);
}

/**
 * 카테고리2 필터 적용
 * @param {string} category2 - 카테고리2 값
 */
export function applyCategory2Filter(category2) {
  applyFilter("category2", category2);
}

/**
 * 브레드크럼 액션 처리
 * @param {string} action - 액션 타입 ('reset', 'category1')
 */
export function handleBreadcrumbAction(action) {
  const updates = {};

  if (action === "reset") {
    // 전체 - 모든 카테고리 초기화
    updates.category1 = null;
    updates.category2 = null;
  } else if (action === "category1") {
    // Category1 클릭 - category2만 초기화
    updates.category2 = null;
  }

  navigateWithParams(updates);
}
