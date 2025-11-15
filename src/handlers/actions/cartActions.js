import { cartState } from "../../stores/cartStore.js";
import { showToast } from "../toast.js";

/**
 * 장바구니에 상품 추가
 * @param {string} productId - 상품 ID
 * @param {Object} productData - 상품 데이터
 * @param {number} quantity - 수량 (기본: 1)
 */
export function addToCart(productId, productData, quantity = 1) {
  const state = cartState.getState();
  const currentItems = Array.isArray(state.items) ? state.items : [];
  const existingItem = currentItems.find((item) => item.productId === productId);

  if (existingItem) {
    // 이미 있으면 수량만 증가
    cartState.setState({
      items: currentItems.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
      ),
    });
  } else {
    // 없으면 새로 추가
    cartState.setState({
      items: [
        ...currentItems,
        {
          productId,
          quantity,
          title: productData.title,
          image: productData.image,
          lprice: productData.lprice,
        },
      ],
    });
  }

  showToast();
}

/**
 * 장바구니에서 상품 수량 증가
 * @param {string} productId - 상품 ID
 */
export function increaseCartQuantity(productId) {
  const currentItems = cartState.getState().items;
  cartState.setState({
    items: currentItems.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)),
  });
}

/**
 * 장바구니에서 상품 수량 감소
 * @param {string} productId - 상품 ID
 */
export function decreaseCartQuantity(productId) {
  const currentItems = cartState.getState().items;
  cartState.setState({
    items: currentItems
      .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))
      .filter((item) => item.quantity > 0),
  });
}

/**
 * 장바구니에서 상품 제거
 * @param {string} productId - 상품 ID
 */
export function removeFromCart(productId) {
  const currentItems = cartState.getState().items;
  cartState.setState({
    items: currentItems.filter((item) => item.productId !== productId),
  });
}

/**
 * 장바구니에서 선택된 상품들 제거
 * @param {string[]} productIds - 상품 ID 배열
 */
export function removeSelectedFromCart(productIds) {
  const currentItems = cartState.getState().items;
  cartState.setState({
    items: currentItems.filter((item) => !productIds.includes(item.productId)),
  });
}

/**
 * 장바구니 비우기
 */
export function clearCart() {
  cartState.setState({ items: [] });
}
