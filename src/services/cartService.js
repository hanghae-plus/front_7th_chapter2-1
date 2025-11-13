import { state } from "../state/appState.js";
import { saveCartToStorage } from "../utils/storage.js";

/**
 * 장바구니 아이템 배열을 반환합니다.
 * @returns {Array} 장바구니 아이템 배열
 */
export function getCartItemsArray() {
  return Object.values(state.cartItems ?? {});
}

/**
 * 장바구니 요약 정보를 반환합니다.
 * @returns {Object} 장바구니 요약 정보
 */
export function getCartSummary() {
  const items = getCartItemsArray();
  const totalCount = items.length;
  const totalPrice = items.reduce((sum, item) => sum + (Number(item?.product?.lprice) || 0) * (item?.quantity ?? 0), 0);
  const selectedItems = items.filter((item) => item?.selected);
  const selectedCount = selectedItems.length;
  const selectedPrice = selectedItems.reduce(
    (sum, item) => sum + (Number(item?.product?.lprice) || 0) * (item?.quantity ?? 0),
    0,
  );
  return { items, totalCount, totalPrice, selectedCount, selectedPrice };
}

/**
 * 장바구니 배지를 업데이트합니다.
 * @param {number} providedCount - 제공된 개수 (옵션)
 */
export function updateCartBadge(providedCount) {
  const badge = document.getElementById("cart-count-badge");
  if (!badge) {
    return;
  }
  const count = providedCount ?? getCartSummary().totalCount;
  if (count > 0) {
    badge.textContent = String(count);
    badge.classList.remove("hidden");
  } else {
    badge.textContent = "";
    badge.classList.add("hidden");
  }
}

/**
 * 상품을 장바구니에서 찾습니다.
 * @param {string} productId - 상품 ID
 * @returns {Object|null} 상품 객체 또는 null
 */
export function findProductForCart(productId) {
  const fromList = state.products.find((item) => item?.productId === productId);
  if (fromList) {
    return fromList;
  }

  if (state.detail?.product?.productId === productId) {
    return state.detail.product;
  }

  return state.cartItems[productId]?.product ?? null;
}

/**
 * 장바구니에 상품을 추가합니다.
 * @param {string} productId - 상품 ID
 * @param {number} quantity - 수량
 * @param {Function} onUpdateBadge - 배지 업데이트 콜백
 * @param {Function} onShowToast - 토스트 표시 콜백
 */
export function handleAddToCart(productId, quantity, onUpdateBadge, onShowToast) {
  if (!productId) {
    return;
  }

  const amount = Math.max(1, Number(quantity) || 1);
  const product = findProductForCart(productId);
  if (!product) {
    console.warn("상품 정보를 찾을 수 없어 장바구니에 담지 못했습니다.", productId);
    if (onShowToast) {
      onShowToast();
    }
    return;
  }

  const price = Number(product.lprice ?? product.price ?? 0);
  const stored = state.cartItems[productId];
  if (!stored) {
    state.cartItems[productId] = {
      product: {
        productId,
        title: product.title ?? "",
        image: product.image ?? "",
        lprice: price,
      },
      quantity: 0,
      selected: false,
    };
  }

  state.cartItems[productId].quantity += amount;
  if (onUpdateBadge) {
    onUpdateBadge();
  }
  if (onShowToast) {
    onShowToast();
  }
  saveCartToStorage(state.cartItems);
}

/**
 * 장바구니 아이템 수량을 증가시킵니다.
 * @param {string} productId - 상품 ID
 * @param {Function} onUpdateQuantity - 수량 업데이트 콜백
 */
export function incrementCartItem(productId, onUpdateQuantity) {
  const item = state.cartItems[productId];
  if (!item) {
    return;
  }
  item.quantity += 1;
  saveCartToStorage(state.cartItems);
  if (onUpdateQuantity) {
    onUpdateQuantity();
  }
}

/**
 * 장바구니 아이템 수량을 감소시킵니다.
 * @param {string} productId - 상품 ID
 * @param {Function} onUpdateQuantity - 수량 업데이트 콜백
 * @param {Function} onRemoveItem - 아이템 제거 콜백
 * @param {Function} onShowToast - 토스트 표시 콜백
 */
export function decrementCartItem(productId, onUpdateQuantity, onRemoveItem, onShowToast) {
  const item = state.cartItems[productId];
  if (!item) {
    return;
  }

  if (item.quantity <= 1) {
    delete state.cartItems[productId];
    saveCartToStorage(state.cartItems);
    if (onShowToast) {
      onShowToast();
    }
    if (onRemoveItem) {
      onRemoveItem(productId);
    }
  } else {
    item.quantity -= 1;
    saveCartToStorage(state.cartItems);
    if (onUpdateQuantity) {
      onUpdateQuantity();
    }
  }
}

/**
 * 장바구니에서 아이템을 제거합니다.
 * @param {string} productId - 상품 ID
 * @param {Function} onRemoveItem - 아이템 제거 콜백
 * @param {Function} onShowToast - 토스트 표시 콜백
 */
export function removeCartItem(productId, onRemoveItem, onShowToast) {
  if (!state.cartItems[productId]) {
    return;
  }

  delete state.cartItems[productId];
  saveCartToStorage(state.cartItems);
  if (onRemoveItem) {
    onRemoveItem(productId);
  }
  if (onShowToast) {
    onShowToast();
  }
}

/**
 * 장바구니를 비웁니다.
 * @param {Function} onRender - 렌더링 콜백
 * @param {Function} onShowToast - 토스트 표시 콜백
 */
export function clearCartItems(onRender, onShowToast) {
  if (Object.keys(state.cartItems).length === 0) {
    return;
  }
  state.cartItems = {};
  if (onRender) {
    onRender();
  }
  if (onShowToast) {
    onShowToast();
  }
  saveCartToStorage(state.cartItems);
}

/**
 * 장바구니 결제를 진행합니다.
 * @param {Function} onShowToast - 토스트 표시 콜백
 */
export function checkoutCart(onShowToast) {
  const { selectedCount, selectedPrice } = getCartSummary();
  if (onShowToast) {
    onShowToast();
  }
  if (selectedCount === 0) {
    console.info("선택된 상품이 없습니다.");
    return;
  }
  console.info(`선택한 ${selectedCount}개의 상품, 총 ${selectedPrice}원 결제 진행 (모의).`);
}
