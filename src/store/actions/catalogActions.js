/**
 * Catalog (상품 목록) 상태 관리 액션
 */

/**
 * 로딩 상태 설정
 */
export const setLoading = (store, isLoading) => {
  store.currentAction = "catalogActions.setLoading";
  store.updateSlice("catalog", { isLoading });
};

/**
 * 상품 목록 설정 (성공)
 */
export const setProducts = (store, products, pagination) => {
  store.currentAction = "catalogActions.setProducts";
  store.updateSlice("catalog", {
    products,
    pagination,
    isLoading: false,
    isLoadingMore: false,
    loadMoreError: null,
  });
};

/**
 * 상품 목록 로딩 에러
 */
export const setError = (store, error) => {
  store.currentAction = "catalogActions.setError";
  store.updateSlice("catalog", {
    isLoading: false,
    loadMoreError: error,
  });
};

/**
 * 더보기 로딩 시작
 */
export const startLoadMore = (store) => {
  store.currentAction = "catalogActions.startLoadMore";
  store.updateSlice("catalog", {
    isLoadingMore: true,
    loadMoreError: null,
  });
};

/**
 * 더보기 성공 (기존 상품에 추가)
 */
export const loadMoreSuccess = (store, newProducts, pagination) => {
  store.currentAction = "catalogActions.loadMoreSuccess";
  store.updateSlice("catalog", (prevCatalog) => ({
    ...prevCatalog,
    products: [...prevCatalog.products, ...newProducts],
    pagination,
    isLoadingMore: false,
    loadMoreError: null,
  }));
};

/**
 * 더보기 실패
 */
export const loadMoreError = (store, error) => {
  store.currentAction = "catalogActions.loadMoreError";
  store.updateSlice("catalog", {
    isLoadingMore: false,
    loadMoreError: error,
  });
};

/**
 * 초기 로딩 상태 설정 (스켈레톤 표시)
 */
export const setInitialLoading = (store) => {
  store.currentAction = "catalogActions.setInitialLoading";
  store.updateSlice("catalog", {
    isLoading: true,
    isLoadingMore: false,
    loadMoreError: null,
  });
};

/**
 * 카탈로그 상태 초기화
 */
export const resetCatalog = (store) => {
  store.currentAction = "catalogActions.resetCatalog";
  store.updateSlice("catalog", {
    products: [],
    pagination: undefined,
    isLoading: false,
    isLoadingMore: false,
    loadMoreError: null,
  });
};
