/**
 * Category (카테고리) 상태 관리 액션
 */

/**
 * 카테고리 로딩 시작
 */
export const startCategoryLoad = (store) => {
  store.currentAction = "categoryActions.startCategoryLoad";
  store.updateSlice("categories", {
    isLoading: true,
    error: null,
  });
};

/**
 * 카테고리 로딩 성공
 */
export const setCategoriesSuccess = (store, categories) => {
  store.currentAction = "categoryActions.setCategoriesSuccess";
  store.updateSlice("categories", {
    data: categories,
    isLoading: false,
    error: null,
  });
};

/**
 * 카테고리 로딩 실패
 */
export const setCategoriesError = (store, error) => {
  store.currentAction = "categoryActions.setCategoriesError";
  store.updateSlice("categories", {
    data: [],
    isLoading: false,
    error,
  });
};
