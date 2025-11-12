/**
 * ProductDetail (상품 상세) 상태 관리 액션
 */

/**
 * 상품 상세 로딩 시작
 */
export const startProductLoad = (store) => {
  store.currentAction = "productDetailActions.startProductLoad";
  store.updateSlice("productDetail", {
    product: null,
    relatedProducts: [],
    isLoading: true,
    error: null,
    quantity: 1,
  });
};

/**
 * 상품 상세 로딩 성공
 */
export const setProductSuccess = (store, product, relatedProducts = []) => {
  store.currentAction = "productDetailActions.setProductSuccess";
  store.updateSlice("productDetail", {
    product,
    relatedProducts,
    isLoading: false,
    error: null,
    quantity: 1,
  });
};

/**
 * 상품 상세 로딩 실패
 */
export const setProductError = (store, error) => {
  store.currentAction = "productDetailActions.setProductError";
  store.updateSlice("productDetail", (prevDetail) => ({
    ...prevDetail,
    isLoading: false,
    error,
  }));
};

/**
 * 수량 변경
 */
export const setQuantity = (store, quantity) => {
  store.currentAction = "productDetailActions.setQuantity";
  store.updateSlice("productDetail", { quantity });
};

/**
 * 상품 상세 상태 초기화
 */
export const resetProductDetail = (store) => {
  store.currentAction = "productDetailActions.resetProductDetail";
  store.updateSlice("productDetail", {
    product: null,
    relatedProducts: [],
    isLoading: false,
    error: null,
    quantity: 1,
  });
};
