import { state } from "../state/appState.js";
import {
  incrementCartItem as incrementCartItemService,
  decrementCartItem as decrementCartItemService,
  removeCartItem as removeCartItemService,
  clearCartItems as clearCartItemsService,
  checkoutCart as checkoutCartService,
  getCartSummary,
  handleAddToCart as handleAddToCartService,
  updateCartBadge,
} from "../services/cartService.js";
import { saveCartToStorage } from "../utils/storage.js";
import {
  renderCartModal,
  updateCartModalSelection,
  updateCartItemQuantity,
  removeCartItemFromModal,
  isCartModalEventsAttached,
  setCartModalEventsAttached,
} from "../renderers/cartRenderer.js";
import { addCartAlert, delCartAlert, infoAlert, showToast } from "../components/Alert.js";

/**
 * 장바구니 아이콘 클릭 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Function} onOpenCartModal - 장바구니 모달 열기 함수
 */
export function handleCartIconClick(event, onOpenCartModal) {
  event.preventDefault();
  if (onOpenCartModal) {
    onOpenCartModal();
  }
}

/**
 * 장바구니 모달 클릭 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Object} options - 옵션
 * @param {Function} options.onCloseCartModal - 장바구니 모달 닫기 함수
 * @param {Function} options.onIncrementCartItem - 장바구니 아이템 증가 함수
 * @param {Function} options.onDecrementCartItem - 장바구니 아이템 감소 함수
 * @param {Function} options.onRemoveCartItem - 장바구니 아이템 제거 함수
 * @param {Function} options.onRemoveSelectedCartItems - 선택한 장바구니 아이템 제거 함수
 * @param {Function} options.onClearCartItems - 장바구니 비우기 함수
 * @param {Function} options.onCheckoutCart - 장바구니 결제 함수
 */
export function handleCartModalClick(
  event,
  {
    onCloseCartModal,
    onIncrementCartItem,
    onDecrementCartItem,
    onRemoveCartItem,
    onRemoveSelectedCartItems,
    onClearCartItems,
    onCheckoutCart,
  },
) {
  const actionButton = event.target.closest("[data-cart-action]");
  if (!actionButton) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const { cartAction, cartProductId } = actionButton.dataset;
  switch (cartAction) {
    case "close":
      if (onCloseCartModal) {
        onCloseCartModal();
      }
      break;
    case "increase":
      if (cartProductId && onIncrementCartItem) {
        onIncrementCartItem(cartProductId);
      }
      break;
    case "decrease":
      if (cartProductId && onDecrementCartItem) {
        onDecrementCartItem(cartProductId);
      }
      break;
    case "remove":
      if (cartProductId && onRemoveCartItem) {
        onRemoveCartItem(cartProductId);
      }
      break;
    case "remove-selected":
      if (onRemoveSelectedCartItems) {
        onRemoveSelectedCartItems();
      }
      break;
    case "clear":
      if (onClearCartItems) {
        onClearCartItems();
      }
      break;
    case "checkout":
      if (onCheckoutCart) {
        onCheckoutCart();
      }
      break;
    default:
      break;
  }
}

/**
 * 장바구니 모달 변경 핸들러
 * @param {Event} event - 이벤트 객체
 * @param {Object} options - 옵션
 * @param {Function} options.onCartCheckboxToggle - 장바구니 체크박스 토글 함수
 * @param {Function} options.onCartSelectAllChange - 장바구니 전체 선택 변경 함수
 */
export function handleCartModalChange(event, { onCartCheckboxToggle, onCartSelectAllChange }) {
  const checkbox = event.target.closest(".cart-item-checkbox");
  if (checkbox) {
    if (onCartCheckboxToggle) {
      onCartCheckboxToggle(checkbox);
    }
    return;
  }

  const selectAll = event.target.closest(".cart-select-all-checkbox");
  if (selectAll) {
    if (onCartSelectAllChange) {
      onCartSelectAllChange(selectAll.checked);
    }
  }
}

/**
 * 장바구니 체크박스 토글 핸들러
 * @param {HTMLInputElement} checkbox - 체크박스 요소
 * @param {Function} onUpdateCartModalSelection - 장바구니 모달 선택 업데이트 함수
 */
export function handleCartCheckboxToggle(checkbox, onUpdateCartModalSelection) {
  const productId = checkbox.dataset.productId;
  if (!productId || !state.cartItems[productId]) {
    return;
  }

  state.cartItems[productId].selected = checkbox.checked;
  if (onUpdateCartModalSelection) {
    onUpdateCartModalSelection();
  }
  saveCartToStorage(state.cartItems);
}

/**
 * 장바구니 전체 선택 변경 핸들러
 * @param {boolean} checked - 체크 상태
 * @param {Function} onUpdateCartModalSelection - 장바구니 모달 선택 업데이트 함수
 */
export function handleCartSelectAllChange(checked, onUpdateCartModalSelection) {
  Object.keys(state.cartItems).forEach((productId) => {
    state.cartItems[productId].selected = checked;
  });
  if (onUpdateCartModalSelection) {
    onUpdateCartModalSelection();
  }
  saveCartToStorage(state.cartItems);
}

/**
 * 장바구니 아이템 증가 핸들러
 * @param {string} productId - 상품 ID
 * @param {Function} onUpdateCartItemQuantity - 장바구니 아이템 수량 업데이트 함수
 * @param {Function} onUpdateCartBadge - 장바구니 배지 업데이트 함수
 */
export function incrementCartItem(productId, onUpdateCartItemQuantity, onUpdateCartBadge) {
  incrementCartItemService(productId, () => {
    if (onUpdateCartItemQuantity) {
      onUpdateCartItemQuantity(productId);
    }
    if (onUpdateCartBadge) {
      const { totalCount } = getCartSummary();
      onUpdateCartBadge(totalCount);
    }
  });
}

/**
 * 장바구니 아이템 감소 핸들러
 * @param {string} productId - 상품 ID
 * @param {Function} onUpdateCartItemQuantity - 장바구니 아이템 수량 업데이트 함수
 * @param {Function} onRemoveCartItemFromModal - 장바구니 아이템 모달에서 제거 함수
 * @param {Function} onShowToast - 토스트 표시 함수
 * @param {Function} onUpdateCartBadge - 장바구니 배지 업데이트 함수
 */
export function decrementCartItem(
  productId,
  onUpdateCartItemQuantity,
  onRemoveCartItemFromModal,
  onShowToast,
  onUpdateCartBadge,
) {
  decrementCartItemService(
    productId,
    () => {
      if (onUpdateCartItemQuantity) {
        onUpdateCartItemQuantity(productId);
      }
      if (onUpdateCartBadge) {
        const { totalCount } = getCartSummary();
        onUpdateCartBadge(totalCount);
      }
    },
    onRemoveCartItemFromModal,
    onShowToast,
  );
}

/**
 * 장바구니 아이템 제거 핸들러
 * @param {string} productId - 상품 ID
 * @param {Function} onRemoveCartItemFromModal - 장바구니 아이템 모달에서 제거 함수
 * @param {Function} onShowToast - 토스트 표시 함수
 * @param {Function} onUpdateCartBadge - 장바구니 배지 업데이트 함수
 */
export function removeCartItem(productId, onRemoveCartItemFromModal, onShowToast, onUpdateCartBadge) {
  removeCartItemService(productId, onRemoveCartItemFromModal, onShowToast);
  if (onUpdateCartBadge) {
    const { totalCount } = getCartSummary();
    onUpdateCartBadge(totalCount);
  }
}

/**
 * 장바구니 비우기 핸들러
 * @param {Function} onRenderCartModal - 장바구니 모달 렌더링 함수
 * @param {Function} onShowToast - 토스트 표시 함수
 */
export function clearCartItems(onRenderCartModal, onShowToast) {
  clearCartItemsService(onRenderCartModal, onShowToast);
}

/**
 * 장바구니 결제 핸들러
 * @param {Function} onShowToast - 토스트 표시 함수
 */
export function checkoutCart(onShowToast) {
  checkoutCartService(onShowToast);
}

/**
 * 선택한 장바구니 아이템 제거 핸들러
 * @param {Object} options - 옵션
 * @param {Function} options.onUpdateCartBadge - 장바구니 배지 업데이트 함수
 * @param {Function} options.onRenderCartModal - 장바구니 모달 렌더링 함수
 * @param {Function} options.onUpdateCartModalSelection - 장바구니 모달 선택 업데이트 함수
 * @param {Function} options.onShowToast - 토스트 표시 함수
 */
export function removeSelectedCartItems({
  onUpdateCartBadge,
  onRenderCartModal,
  onUpdateCartModalSelection,
  onShowToast,
}) {
  const before = Object.keys(state.cartItems).length;
  const removedProductIds = [];

  Object.keys(state.cartItems).forEach((productId) => {
    if (state.cartItems[productId]?.selected) {
      removedProductIds.push(productId);
      delete state.cartItems[productId];
    }
  });

  if (Object.keys(state.cartItems).length !== before) {
    if (onUpdateCartBadge) {
      const { totalCount } = getCartSummary();
      onUpdateCartBadge(totalCount);
    }

    // cart-items-container에서 선택된 상품들만 제거 (부분 렌더링)
    if (state.isCartOpen) {
      const modal = document.querySelector(".cart-modal");
      if (modal) {
        // 개별 상품 아이템만 DOM에서 제거
        removedProductIds.forEach((productId) => {
          const cartItem = modal.querySelector(`.cart-item[data-product-id="${productId}"]`);
          if (cartItem) {
            cartItem.remove();
          }
        });

        // 장바구니가 비어있으면 모달 전체 재렌더링
        if (Object.keys(state.cartItems).length === 0) {
          if (onRenderCartModal) {
            onRenderCartModal();
          }
        } else {
          // 선택 정보와 총 금액만 업데이트 (부분 렌더링)
          if (onUpdateCartModalSelection) {
            onUpdateCartModalSelection();
          }
        }
      }
    }

    if (onShowToast) {
      onShowToast();
    }
    saveCartToStorage(state.cartItems);
  }
}

let cartEscapeListenerAttached = false;

/**
 * 장바구니에 상품 추가 핸들러
 * @param {string} productId - 상품 ID
 * @param {number} quantity - 수량
 */
export function handleAddToCart(productId, quantity) {
  handleAddToCartService(productId, quantity, updateCartBadge, () => showToast(addCartAlert));
}

/**
 * 장바구니 모달을 위한 이벤트 옵션 생성
 * @param {Function} attachCartModalEventsFn - 장바구니 모달 이벤트 연결 함수
 * @param {Function} renderCartModalForCart - 장바구니 모달 렌더링 함수
 * @param {Function} closeCartModal - 장바구니 모달 닫기 함수
 * @returns {Object} 장바구니 모달 이벤트 옵션
 */
export function createCartModalOptions(attachCartModalEventsFn, renderCartModalForCart, closeCartModal) {
  return {
    onCloseCartModal: closeCartModal,
    onIncrementCartItem: (productId) =>
      incrementCartItem(
        productId,
        (productId) => updateCartItemQuantity(productId, attachCartModalEventsFn),
        updateCartBadge,
      ),
    onDecrementCartItem: (productId) =>
      decrementCartItem(
        productId,
        (productId) => updateCartItemQuantity(productId, attachCartModalEventsFn),
        (productId) => removeCartItemFromModal(productId, attachCartModalEventsFn, () => renderCartModalForCart()),
        () => showToast(delCartAlert),
        updateCartBadge,
      ),
    onRemoveCartItem: (productId) =>
      removeCartItem(
        productId,
        (productId) => removeCartItemFromModal(productId, attachCartModalEventsFn, () => renderCartModalForCart()),
        () => showToast(delCartAlert),
        updateCartBadge,
      ),
    onRemoveSelectedCartItems: () =>
      removeSelectedCartItems({
        onUpdateCartBadge: updateCartBadge,
        onRenderCartModal: () => renderCartModalForCart(),
        onUpdateCartModalSelection: () =>
          updateCartModalSelection({
            onAttachCartModalEvents: attachCartModalEventsFn,
          }),
        onShowToast: () => showToast(delCartAlert),
      }),
    onClearCartItems: () =>
      clearCartItems(
        () => renderCartModalForCart(),
        () => showToast(delCartAlert),
      ),
    onCheckoutCart: () => checkoutCart(() => showToast(infoAlert)),
  };
}

/**
 * 장바구니 모달 렌더링 함수 (재사용을 위한 래퍼)
 * @param {Function} attachCartModalEvents - 장바구니 모달 이벤트 연결 함수
 * @param {Function} attachCartEscapeListener - 장바구니 ESC 키 리스너 연결 함수
 * @param {Function} detachCartEscapeListener - 장바구니 ESC 키 리스너 해제 함수
 * @param {Function} renderCartModalForCart - 장바구니 모달 렌더링 함수 (재귀 호출용)
 * @param {Function} closeCartModal - 장바구니 모달 닫기 함수
 * @returns {Function} 장바구니 모달 렌더링 함수
 */
export function renderCartModalForCart(
  attachCartModalEvents,
  attachCartEscapeListener,
  detachCartEscapeListener,
  renderCartModalForCart,
  closeCartModal,
) {
  return renderCartModal({
    attachCartModalEvents: (container) =>
      attachCartModalEvents(
        container,
        createCartModalOptions(attachCartModalEvents, renderCartModalForCart, closeCartModal),
      ),
    attachCartEscapeListener,
    detachCartEscapeListener,
  });
}

/**
 * 장바구니 모달 이벤트 연결
 * @param {HTMLElement} container - 컨테이너 요소
 * @param {Object} options - 이벤트 옵션
 */
export function attachCartModalEvents(container, options) {
  if (isCartModalEventsAttached()) {
    return;
  }

  container.addEventListener("click", (event) => handleCartModalClick(event, options));
  container.addEventListener("change", (event) =>
    handleCartModalChange(event, {
      onCartCheckboxToggle: (checkbox) =>
        handleCartCheckboxToggle(checkbox, () =>
          updateCartModalSelection({
            onAttachCartModalEvents: (modal) => attachCartModalEvents(modal, options),
          }),
        ),
      onCartSelectAllChange: (checked) =>
        handleCartSelectAllChange(checked, () =>
          updateCartModalSelection({
            onAttachCartModalEvents: (modal) => attachCartModalEvents(modal, options),
          }),
        ),
    }),
  );
  setCartModalEventsAttached(true);
}

/**
 * 장바구니 키다운 핸들러
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {Function} closeCartModal - 장바구니 모달 닫기 함수
 */
export function handleCartKeydown(event, closeCartModal) {
  if (event.key === "Escape") {
    closeCartModal();
  }
}

/**
 * 장바구니 ESC 키 리스너 연결
 * @param {Function} closeCartModal - 장바구니 모달 닫기 함수
 */
export function attachCartEscapeListener(closeCartModal) {
  if (cartEscapeListenerAttached) {
    return;
  }
  const handler = (event) => handleCartKeydown(event, closeCartModal);
  document.addEventListener("keydown", handler);
  cartEscapeListenerAttached = { attached: true, handler };
}

/**
 * 장바구니 ESC 키 리스너 해제
 */
export function detachCartEscapeListener() {
  if (!cartEscapeListenerAttached || !cartEscapeListenerAttached.attached) {
    return;
  }
  document.removeEventListener("keydown", cartEscapeListenerAttached.handler);
  cartEscapeListenerAttached = false;
}

/**
 * 장바구니 모달 열기
 * @param {Function} renderCartModalForCart - 장바구니 모달 렌더링 함수
 */
export function openCartModal(renderCartModalForCart) {
  state.isCartOpen = true;
  renderCartModalForCart();
}

/**
 * 장바구니 모달 닫기
 * @param {Function} renderCartModalForCart - 장바구니 모달 렌더링 함수
 */
export function closeCartModal(renderCartModalForCart) {
  if (!state.isCartOpen) {
    return;
  }
  state.isCartOpen = false;
  renderCartModalForCart();
}
