/**
 * Cart (장바구니) 상태 관리 액션
 */

/**
 * 장바구니에 상품 추가 (기존 상품이면 수량 증가)
 */
export const addToCart = (store, product) => {
  store.currentAction = "cartActions.addToCart";

  store.updateSlice("cart", (prevCart) => {
    const { items } = prevCart;
    const existingIndex = items.findIndex((item) => item.productId === product.productId);

    let newItems;
    if (existingIndex >= 0) {
      // 기존 상품 수량 증가
      const existingItem = items[existingIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      };
      newItems = [...items.slice(0, existingIndex), updatedItem, ...items.slice(existingIndex + 1)];
    } else {
      // 새 상품 추가
      const newItem = {
        productId: product.productId,
        title: product.title ?? "",
        price: product.price ?? "",
        image: product.image ?? "",
        brand: product.brand ?? "",
        quantity: 1,
      };
      newItems = [...items, newItem];
    }

    return {
      ...prevCart,
      items: newItems,
    };
  });
};

/**
 * 장바구니 상품 수량 변경
 */
export const updateCartItemQuantity = (store, productId, quantity) => {
  store.currentAction = "cartActions.updateCartItemQuantity";

  store.updateSlice("cart", (prevCart) => {
    const { items } = prevCart;
    const index = items.findIndex((item) => item.productId === productId);

    if (index === -1) return prevCart;

    const updatedItem = { ...items[index], quantity };
    const newItems = [...items.slice(0, index), updatedItem, ...items.slice(index + 1)];

    return {
      ...prevCart,
      items: newItems,
    };
  });
};

/**
 * 장바구니에서 상품 제거
 */
export const removeCartItem = (store, productId) => {
  store.currentAction = "cartActions.removeCartItem";

  store.updateSlice("cart", (prevCart) => {
    const newItems = prevCart.items.filter((item) => item.productId !== productId);
    const newSelectedIds = new Set(prevCart.selectedIds);
    newSelectedIds.delete(productId);

    return {
      ...prevCart,
      items: newItems,
      selectedIds: newSelectedIds,
    };
  });
};

/**
 * 선택된 장바구니 상품 일괄 제거
 */
export const removeSelectedCartItems = (store) => {
  store.currentAction = "cartActions.removeSelectedCartItems";

  store.updateSlice("cart", (prevCart) => {
    const newItems = prevCart.items.filter((item) => !prevCart.selectedIds.has(item.productId));

    return {
      ...prevCart,
      items: newItems,
      selectedIds: new Set(),
    };
  });
};

/**
 * 장바구니 전체 비우기
 */
export const clearCart = (store) => {
  store.currentAction = "cartActions.clearCart";

  store.updateSlice("cart", (prevCart) => ({
    ...prevCart,
    items: [],
    selectedIds: new Set(),
  }));
};

/**
 * 장바구니 상품 선택/해제
 */
export const toggleCartItemSelection = (store, productId) => {
  store.currentAction = "cartActions.toggleCartItemSelection";

  store.updateSlice("cart", (prevCart) => {
    const newSelectedIds = new Set(prevCart.selectedIds);

    if (newSelectedIds.has(productId)) {
      newSelectedIds.delete(productId);
    } else {
      newSelectedIds.add(productId);
    }

    return {
      ...prevCart,
      selectedIds: newSelectedIds,
    };
  });
};

/**
 * 장바구니 전체 선택/해제
 */
export const toggleAllCartItems = (store, selectAll) => {
  store.currentAction = "cartActions.toggleAllCartItems";

  store.updateSlice("cart", (prevCart) => {
    const newSelectedIds = selectAll ? new Set(prevCart.items.map((item) => item.productId)) : new Set();

    return {
      ...prevCart,
      selectedIds: newSelectedIds,
    };
  });
};

/**
 * 장바구니 모달 열기
 */
export const openCartModal = (store, modalElement, lastFocusedElement, escListener) => {
  store.currentAction = "cartActions.openCartModal";

  store.updateSlice("cart", (prevCart) => ({
    ...prevCart,
    isOpen: true,
    modalElement,
    lastFocusedElement,
    escListener,
  }));
};

/**
 * 장바구니 모달 닫기
 */
export const closeCartModal = (store) => {
  store.currentAction = "cartActions.closeCartModal";

  store.updateSlice("cart", (prevCart) => ({
    ...prevCart,
    isOpen: false,
    modalElement: null,
    lastFocusedElement: null,
    escListener: null,
  }));
};

/**
 * 장바구니 아이템 설정 (localStorage에서 로드)
 */
export const setCartItems = (store, items) => {
  store.currentAction = "cartActions.setCartItems";

  store.updateSlice("cart", (prevCart) => ({
    ...prevCart,
    items,
  }));
};

/**
 * 장바구니 선택 상태 설정 (localStorage에서 로드)
 */
export const setCartSelection = (store, selectedIds) => {
  store.currentAction = "cartActions.setCartSelection";

  store.updateSlice("cart", (prevCart) => ({
    ...prevCart,
    selectedIds: new Set(selectedIds),
  }));
};
