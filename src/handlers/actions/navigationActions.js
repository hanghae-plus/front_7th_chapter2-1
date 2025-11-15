import { navigateTo } from "../utils/urlHelpers.js";

/**
 * 상품 상세 페이지로 이동
 * @param {string} productId - 상품 ID
 */
export function navigateToProduct(productId) {
  navigateTo(`/product/${productId}`);
}

/**
 * 홈 페이지로 이동
 * @param {Object} params - URL 파라미터 (선택)
 */
export function navigateToHome(params = {}) {
  const queryString = Object.keys(params).length > 0 ? `?${new URLSearchParams(params).toString()}` : "";
  navigateTo(`/${queryString}`);
}

/**
 * 뒤로 가기
 */
export function navigateBack() {
  window.history.back();
}
