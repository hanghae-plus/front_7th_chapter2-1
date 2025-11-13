const CART_STORAGE_KEY = "shopping_cart";

// 장바구니 변경을 구독하는 리스너들
const cartListeners = [];

/**
 * 장바구니 변경을 구독
 * @param {Function} callback - 장바구니 변경 시 호출될 함수
 * @returns {Function} 구독 해제 함수
 */
export const subscribeCartChange = (callback) => {
  cartListeners.push(callback);

  // 구독 해제 함수 반환
  return () => {
    const index = cartListeners.indexOf(callback);
    if (index > -1) {
      cartListeners.splice(index, 1);
    }
  };
};

/**
 * 장바구니 변경 시 모든 구독자에게 알림
 */
const notifyCartChange = () => {
  cartListeners.forEach((callback) => callback());
};

/**
 * LocalStorage에서 장바구니 데이터 읽기
 */
const getCartItems = () => {
  const data = localStorage.getItem(CART_STORAGE_KEY);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return parsed?.items || [];
  } catch {
    return [];
  }
};

/**
 * 장바구니 데이터를 LocalStorage에 저장
 */
const saveCartItems = (items) => {
  const existingData = localStorage.getItem(CART_STORAGE_KEY);
  let selectedAll = false;

  if (existingData) {
    try {
      const parsed = JSON.parse(existingData);
      selectedAll = parsed.selectedAll || false;
    } catch {
      // JSON 파싱 실패 시 기본값 사용
    }
  }

  const data = {
    items: items,
    selectedAll: selectedAll,
  };

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
};

/**
 * 상품을 장바구니에 추가 (이미 있으면 수량만 증가)
 */
const addCartItem = (product, quantity) => {
  const items = getCartItems();
  const existingItem = items.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    items.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: quantity,
      selected: false,
    });
  }

  saveCartItems(items);
  notifyCartChange(); // 구독자들에게 알림
};

/**
 * 특정 상품의 수량 변경
 */
const updateItemQuantity = (productId, newQuantity) => {
  const items = getCartItems();
  const item = items.find((item) => item.id === productId);

  if (item) {
    item.quantity = Math.max(1, newQuantity);
    saveCartItems(items);
    notifyCartChange(); // 구독자들에게 알림
  }
};

/**
 * 특정 상품을 장바구니에서 삭제
 */
const removeItem = (productId) => {
  const items = getCartItems();
  const filteredItems = items.filter((item) => item.id !== productId);
  saveCartItems(filteredItems);
  notifyCartChange(); // 구독자들에게 알림
};

/**
 * 선택된 모든 아이템 삭제
 */
const removeSelectedItems = () => {
  const items = getCartItems();
  const filteredItems = items.filter((item) => !item.selected);
  saveCartItems(filteredItems);
  notifyCartChange(); // 구독자들에게 알림
};

/**
 * 장바구니 전체 비우기
 */
const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  notifyCartChange(); // 구독자들에게 알림
};

/**
 * 특정 아이템의 선택 상태 변경
 */
const toggleItemSelection = (productId, checked) => {
  const items = getCartItems();
  const existingItem = items.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.selected = checked;
  }

  // 모든 아이템이 선택되었는지 확인
  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const data = {
    items: items,
    selectedAll: allSelected,
  };

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
};

/**
 * 모든 아이템 선택/해제
 */
const toggleAllSelection = (checked) => {
  const items = getCartItems();

  items.forEach((item) => {
    item.selected = checked;
  });

  const data = {
    items: items,
    selectedAll: checked,
  };

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
};

/**
 * 장바구니 아이템 개수 반환 (수량이 아닌 종류 개수)
 */
const getCartCount = () => {
  const items = getCartItems();
  return items.length;
};

export {
  getCartItems,
  saveCartItems,
  addCartItem,
  updateItemQuantity,
  removeItem,
  removeSelectedItems,
  clearCart,
  toggleItemSelection,
  toggleAllSelection,
  getCartCount,
};
