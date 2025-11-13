import { CART_STORAGE_KEY } from "./constants.js";

/**
 * localStorage에서 장바구니 정보를 로드합니다.
 * @returns {Object} 장바구니 아이템 객체
 */
export function loadCartFromStorage() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object") {
      return Object.fromEntries(
        Object.entries(parsed).map(([productId, item]) => [
          productId,
          {
            product: item.product ?? {},
            quantity: Number(item.quantity) || 1,
            selected: Boolean(item.selected),
          },
        ]),
      );
    }
  } catch (error) {
    console.error("장바구니 정보를 복원하지 못했습니다.", error);
  }
  return {};
}

/**
 * localStorage에 장바구니 정보를 저장합니다.
 * @param {Object} cartItems - 저장할 장바구니 아이템 객체
 */
export function saveCartToStorage(cartItems) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error("장바구니 정보를 저장하지 못했습니다.", error);
  }
}
