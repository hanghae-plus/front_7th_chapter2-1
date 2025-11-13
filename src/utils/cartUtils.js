/**
 * 장바구니 관련 유틸리티 함수
 */

/**
 * 상품을 장바구니에 추가하거나 수량을 증가시킵니다
 * @param {Array} cartList - 현재 장바구니 목록
 * @param {Object} product - 추가할 상품 정보
 * @param {number} quantity - 추가할 수량 (기본값: 1)
 * @returns {Array} 업데이트된 장바구니 목록
 */
export const addToCart = (cartList, product, quantity = 1) => {
  const existingCart = [...cartList];
  const existingItemIndex = existingCart.findIndex((item) => item.productId === product.productId);

  if (existingItemIndex !== -1) {
    return existingCart.map((item, index) =>
      index === existingItemIndex
        ? {
            ...item,
            quantity: item.quantity + quantity,
          }
        : item,
    );
  }

  return [
    ...existingCart,
    {
      productId: product.productId,
      title: product.title,
      price: product.lprice,
      image: product.image,
      quantity: quantity,
      isSelected: false,
    },
  ];
};

/**
 * 장바구니 아이템 수량을 변경합니다
 * @param {Array} cartList - 현재 장바구니 목록
 * @param {string} productId - 상품 ID
 * @param {number} delta - 수량 변경량 (양수: 증가, 음수: 감소)
 * @returns {Array} 업데이트된 장바구니 목록
 */
export const updateCartQuantity = (cartList, productId, delta) => {
  const cartListCopy = [...cartList];
  const itemIndex = cartListCopy.findIndex((item) => item.productId === productId);

  if (itemIndex === -1) return cartListCopy;

  const newQuantity = cartListCopy[itemIndex].quantity + delta;
  if (newQuantity < 1) return cartListCopy;

  cartListCopy[itemIndex] = {
    ...cartListCopy[itemIndex],
    quantity: newQuantity,
  };

  return cartListCopy;
};

/**
 * 장바구니에서 아이템을 제거합니다
 * @param {Array} cartList - 현재 장바구니 목록
 * @param {string} productId - 제거할 상품 ID
 * @returns {Array} 업데이트된 장바구니 목록
 */
export const removeFromCart = (cartList, productId) => {
  return cartList.filter((item) => item.productId !== productId);
};

/**
 * 장바구니에서 선택된 아이템들을 제거합니다
 * @param {Array} cartList - 현재 장바구니 목록
 * @returns {Array} 업데이트된 장바구니 목록
 */
export const removeSelectedFromCart = (cartList) => {
  return cartList.filter((item) => !item.isSelected);
};

/**
 * 장바구니 아이템의 선택 상태를 토글합니다
 * @param {Array} cartList - 현재 장바구니 목록
 * @param {string} productId - 상품 ID
 * @returns {Array} 업데이트된 장바구니 목록
 */
export const toggleCartItemSelection = (cartList, productId) => {
  return cartList.map((item) => (item.productId === productId ? { ...item, isSelected: !item.isSelected } : item));
};

/**
 * 장바구니의 모든 아이템 선택 상태를 변경합니다
 * @param {Array} cartList - 현재 장바구니 목록
 * @param {boolean} isSelected - 선택 상태
 * @returns {Array} 업데이트된 장바구니 목록
 */
export const selectAllCartItems = (cartList, isSelected) => {
  return cartList.map((item) => ({ ...item, isSelected }));
};
