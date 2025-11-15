/**
 * 장바구니 상태 관리
 */

const STORAGE_KEY = "shopping_cart";

// 장바구니 상태
let cartItems = [];
let selectedAll = false;
let listeners = [];

// localStorage에서 불러오기
export function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      cartItems = data.items || [];
      selectedAll = data.selectedAll || false;
    }
  } catch (error) {
    console.error("Failed to load cart:", error);
  }
}

// localStorage에 저장
function saveCart() {
  try {
    const data = {
      items: cartItems,
      selectedAll: selectedAll,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
}

// 변경 알림
function notifyListeners() {
  listeners.forEach((listener) => listener({ cartItems, selectedAll }));
}

// 리스너 등록
export function subscribeCart(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// 장바구니 아이템 가져오기
export function getCartItems() {
  return [...cartItems];
}

// 선택된 아이템 가져오기
export function getSelectedItems() {
  return cartItems.filter((item) => item.selected).map((item) => item.id);
}

// 장바구니에 추가
export function addToCart(product) {
  const existingItem = cartItems.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      selected: false,
    });
  }

  saveCart();
  notifyListeners();
}

// 수량 증가
export function increaseQuantity(productId) {
  const item = cartItems.find((item) => item.id === productId);
  if (item) {
    item.quantity += 1;
    saveCart();
    notifyListeners();
  }
}

// 수량 감소
export function decreaseQuantity(productId) {
  const item = cartItems.find((item) => item.id === productId);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
    saveCart();
    notifyListeners();
  }
}

// 아이템 삭제
export function removeFromCart(productId) {
  cartItems = cartItems.filter((item) => item.id !== productId);
  updateSelectedAll();
  saveCart();
  notifyListeners();
}

// 전체 비우기
export function clearCart() {
  cartItems = [];
  selectedAll = false;
  saveCart();
  notifyListeners();
}

// 아이템 선택/해제
export function toggleSelectItem(productId, isSelected) {
  const item = cartItems.find((item) => item.id === productId);
  if (item) {
    item.selected = isSelected;
    updateSelectedAll();
    saveCart();
    notifyListeners();
  }
}

// selectedAll 상태 업데이트
function updateSelectedAll() {
  selectedAll = cartItems.length > 0 && cartItems.every((item) => item.selected);
}

// 전체 선택/해제
export function toggleSelectAll(isSelected) {
  selectedAll = isSelected;
  cartItems.forEach((item) => {
    item.selected = isSelected;
  });
  saveCart();
  notifyListeners();
}

// 선택된 아이템 삭제
export function removeSelectedItems() {
  cartItems = cartItems.filter((item) => !item.selected);
  selectedAll = false;
  saveCart();
  notifyListeners();
}

// 장바구니 아이템 개수
export function getCartCount() {
  return cartItems.length;
}

// 초기화
loadCart();
