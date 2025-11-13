// 로컬스토리지 키
const STORAGE_KEYS = {
  CART: "shopping_cart",
  CART_COUNT: "shopping_cart_count",
};

// 로컬스토리지에서 안전하게 데이터 읽기
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`로컬스토리지 읽기 실패 (${key}):`, error);
    return defaultValue;
  }
}

// 로컬스토리지에 데이터 저장
export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`로컬스토리지 저장 실패 (${key}):`, error);
  }
}

// 로컬스토리지에서 데이터 삭제
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`로컬스토리지 삭제 실패 (${key}):`, error);
  }
}

// 로컬스토리지 전체 초기화
export function clearStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("로컬스토리지 초기화 실패:", error);
  }
}

// 장바구니 전용 헬퍼 함수들
export const cartStorage = {
  // 장바구니 불러오기
  getCart() {
    return getFromStorage(STORAGE_KEYS.CART, []);
  },

  // 장바구니 저장하기
  setCart(cart) {
    setToStorage(STORAGE_KEYS.CART, cart);
    setToStorage(STORAGE_KEYS.CART_COUNT, cart.length);
  },

  // 장바구니 카운트 불러오기
  getCartCount() {
    return getFromStorage(STORAGE_KEYS.CART_COUNT, 0);
  },

  // 장바구니 비우기
  clearCart() {
    removeFromStorage(STORAGE_KEYS.CART);
    removeFromStorage(STORAGE_KEYS.CART_COUNT);
  },
};
