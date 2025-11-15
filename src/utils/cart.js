// localStorage 키
const CART_STORAGE_KEY = "shopping_cart";

// localStorage에서 장바구니 데이터 불러오기
export const loadCartFromStorage = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error("장바구니 데이터 로드 실패:", error);
    return [];
  }
};

// localStorage에 장바구니 데이터 저장하기
export const saveCartToStorage = (cartItems) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    console.log("✅ 장바구니 저장 완료:", cartItems);
  } catch (error) {
    console.error("장바구니 데이터 저장 실패:", error);
  }
};

// 장바구니에 상품 추가
export const addToCart = (product, quantity = 1) => {
  const cart = loadCartFromStorage();

  // 이미 장바구니에 있는 상품인지 확인
  const existingItemIndex = cart.findIndex((item) => item.productId === product.productId);

  if (existingItemIndex > -1) {
    // 이미 있으면 수량만 증가
    cart[existingItemIndex].quantity += quantity;
    console.log(`📦 기존 상품 수량 증가: ${product.title} (${cart[existingItemIndex].quantity}개)`);
  } else {
    // 없으면 새로 추가
    cart.push({
      ...product,
      quantity,
    });
    console.log(`✨ 새 상품 추가: ${product.title} (${quantity}개)`);
  }

  saveCartToStorage(cart);
  return cart;
};

// 장바구니 상품 수량 변경
export const updateCartItemQuantity = (productId, quantity) => {
  const cart = loadCartFromStorage();
  const itemIndex = cart.findIndex((item) => item.productId === productId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // 수량이 0 이하면 삭제
      cart.splice(itemIndex, 1);
      console.log(`🗑️ 상품 제거: ${productId}`);
    } else {
      cart[itemIndex].quantity = quantity;
      console.log(`🔄 수량 변경: ${productId} -> ${quantity}개`);
    }
  }

  saveCartToStorage(cart);
  return cart;
};

// 장바구니에서 상품 제거
export const removeFromCart = (productId) => {
  const cart = loadCartFromStorage();
  const filteredCart = cart.filter((item) => item.productId !== productId);
  saveCartToStorage(filteredCart);
  console.log(`🗑️ 상품 제거: ${productId}`);
  return filteredCart;
};

// 장바구니 비우기
export const clearCart = () => {
  saveCartToStorage([]);
  console.log("🗑️ 장바구니 전체 비우기");
  return [];
};

// 장바구니 총 금액 계산
export const getCartTotal = (cart) => {
  return cart.reduce((total, item) => {
    return total + item.lprice * item.quantity;
  }, 0);
};

// 장바구니 총 상품 개수
export const getCartItemCount = (cart) => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};
