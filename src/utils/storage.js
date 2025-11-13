/**
 * localStorage 유틸리티 함수
 */

const CART_STORAGE_KEY = "shopping-cart";

/**
 * localStorage에서 cartState 복원
 * @returns {Object} 복원된 cartState 또는 기본값
 */
export const getCartStateFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load cart state from localStorage:", error);
  }
  return { items: [] };
};

/**
 * localStorage에 cartState 저장
 * @param {Object} state - 저장할 cartState
 */
export const saveCartStateToStorage = (state) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save cart state to localStorage:", error);
  }
};
