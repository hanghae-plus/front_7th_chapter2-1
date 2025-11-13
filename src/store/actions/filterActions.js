/**
 * Filter (필터/검색) 상태 관리 액션
 */

/**
 * 검색어 설정
 */
export const setSearchQuery = (store, query) => {
  store.currentAction = "filterActions.setSearchQuery";
  store.updateSlice("filters", { search: query, page: 1 });
};

/**
 * 카테고리 선택 (category1, category2)
 */
export const setCategory = (store, { category1 = "", category2 = "" }) => {
  store.currentAction = "filterActions.setCategory";
  store.updateSlice("filters", {
    category1,
    category2: category1 ? category2 : "", // category1이 없으면 category2도 비움
    page: 1,
  });
};

/**
 * 정렬 기준 변경
 */
export const setSortOption = (store, sort) => {
  store.currentAction = "filterActions.setSortOption";
  store.updateSlice("filters", { sort, page: 1 });
};

/**
 * 페이지 크기 변경
 */
export const setPageLimit = (store, limit) => {
  store.currentAction = "filterActions.setPageLimit";
  store.updateSlice("filters", { limit, page: 1 });
};

/**
 * 페이지 번호 설정
 */
export const setPage = (store, page) => {
  store.currentAction = "filterActions.setPage";
  store.updateSlice("filters", { page });
};

/**
 * 필터 초기화
 */
export const resetFilters = (store, defaults = {}) => {
  store.currentAction = "filterActions.resetFilters";
  store.updateSlice("filters", {
    search: "",
    category1: "",
    category2: "",
    page: 1,
    ...defaults,
  });
};

/**
 * 여러 필터를 한 번에 업데이트
 */
export const updateFilters = (store, filterUpdates) => {
  store.currentAction = "filterActions.updateFilters";
  store.updateSlice("filters", filterUpdates);
};
