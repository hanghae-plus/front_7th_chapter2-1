import { Cart } from "../components/index.js";
import { state } from "../state/appState.js";
import { getCartSummary, updateCartBadge } from "../services/cartService.js";

// 모듈 레벨 상태
let cartModalEventsAttached = false;

/**
 * 장바구니 모달 이벤트 연결 상태를 리셋합니다.
 */
export function resetCartModalEvents() {
  cartModalEventsAttached = false;
}

/**
 * 장바구니 모달 이벤트 연결 상태를 확인합니다.
 * @returns {boolean} 연결 상태
 */
export function isCartModalEventsAttached() {
  return cartModalEventsAttached;
}

/**
 * 장바구니 모달 이벤트 연결 상태를 설정합니다.
 * @param {boolean} attached - 연결 상태
 */
export function setCartModalEventsAttached(attached) {
  cartModalEventsAttached = attached;
}

/**
 * 장바구니 모달을 렌더링합니다.
 * @param {Object} options - 옵션
 * @param {Function} options.attachCartModalEvents - 장바구니 모달 이벤트 연결 함수
 * @param {Function} options.attachCartEscapeListener - 장바구니 ESC 리스너 연결 함수
 * @param {Function} options.detachCartEscapeListener - 장바구니 ESC 리스너 해제 함수
 */
export function renderCartModal({ attachCartModalEvents, attachCartEscapeListener, detachCartEscapeListener }) {
  // main 태그를 찾아서 형제 태그로 모달을 추가
  const mainElement = document.querySelector("main");
  // Cart 컴포넌트가 반환하는 최상위 div.cart-modal을 찾음
  const existing = mainElement?.nextElementSibling?.classList?.contains("cart-modal")
    ? mainElement.nextElementSibling
    : null;

  if (!state.isCartOpen) {
    if (existing) {
      existing.remove();
    }
    detachCartEscapeListener();
    setCartModalEventsAttached(false);
    updateCartBadge();
    return;
  }

  const { items, totalCount, totalPrice, selectedCount, selectedPrice } = getCartSummary();

  let container = existing;
  if (!container && mainElement) {
    // Cart 컴포넌트의 HTML을 직접 삽입
    const cartHTML = Cart({ items, totalCount, totalPrice, selectedCount, selectedPrice });
    mainElement.insertAdjacentHTML("afterend", cartHTML);
    // 삽입된 최상위 div.cart-modal 요소를 찾음
    container = mainElement.nextElementSibling;
  } else if (container) {
    // 기존 컨테이너가 있으면 내용만 업데이트
    // innerHTML을 사용하면 기존 이벤트 리스너가 제거되므로, 이벤트를 다시 연결해야 함
    setCartModalEventsAttached(false);
    container.innerHTML = Cart({ items, totalCount, totalPrice, selectedCount, selectedPrice });
  }

  if (container && container.classList.contains("cart-modal")) {
    attachCartModalEvents(container);
    attachCartEscapeListener();
    updateCartBadge(totalCount);
  }
}

/**
 * 장바구니 모달 선택 정보를 업데이트합니다.
 * @param {Object} options - 옵션
 * @param {Function} options.onAttachCartModalEvents - 장바구니 모달 이벤트 연결 함수
 */
export function updateCartModalSelection({ onAttachCartModalEvents }) {
  if (!state.isCartOpen) {
    return;
  }

  const modal = document.querySelector(".cart-modal");
  if (!modal) {
    return;
  }

  // 각 상품 체크박스 업데이트
  Object.keys(state.cartItems).forEach((productId) => {
    const item = state.cartItems[productId];
    const checkbox = modal.querySelector(`.cart-item-checkbox[data-product-id="${productId}"]`);
    if (checkbox && checkbox.checked !== item.selected) {
      checkbox.checked = item.selected;
    }
  });

  // 하단 섹션 업데이트 (총 금액, 선택 정보 포함)
  updateCartBottomSection(onAttachCartModalEvents);
}

/**
 * 장바구니 하단 섹션(총 금액 등)을 업데이트합니다.
 * @param {Function} onAttachCartModalEvents - 장바구니 모달 이벤트 연결 함수
 */
function updateCartBottomSection(onAttachCartModalEvents) {
  if (!state.isCartOpen) {
    return;
  }

  const modal = document.querySelector(".cart-modal");
  if (!modal) {
    return;
  }

  const { totalCount, selectedCount, selectedPrice, totalPrice } = getCartSummary();

  // 하단 섹션 업데이트
  const bottomSection = modal.querySelector(".border-t.border-gray-200.p-4.bg-gray-50");
  if (bottomSection) {
    const formatPrice = (value) => {
      const numeric = Number(value) || 0;
      return `${numeric.toLocaleString()}원`;
    };

    if (selectedCount > 0) {
      bottomSection.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm text-gray-600">
            <span>선택한 상품</span>
            <span class="font-medium text-gray-900">${selectedCount}개 / ${formatPrice(selectedPrice)}</span>
          </div>
          <div class="flex items-center justify-between text-sm text-gray-600">
            <span>총 금액</span>
            <span class="text-lg font-bold text-blue-600">${formatPrice(totalPrice)}</span>
          </div>
          <button
            id="cart-modal-remove-selected-btn"
            class="w-full bg-red-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-600 transition"
            data-cart-action="remove-selected"
          >
            선택한 상품 삭제
          </button>
          <div class="flex gap-2">
            <button
              id="cart-modal-clear-cart-btn"
              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 transition"
              data-cart-action="clear"
            >
              전체 비우기
            </button>
            <button
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              data-cart-action="checkout"
            >
              구매하기
            </button>
          </div>
        </div>
      `;
    } else {
      bottomSection.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">총 금액</span>
            <span class="text-lg font-bold text-blue-600">${formatPrice(totalPrice)}</span>
          </div>
          <div class="flex gap-2 pt-1">
            <button
              id="cart-modal-clear-cart-btn"
              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 transition"
              data-cart-action="clear"
            >
              전체 비우기
            </button>
            <button
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition"
              data-cart-action="checkout"
            >
              구매하기
            </button>
          </div>
        </div>
      `;
    }

    // 이벤트 리스너 재연결
    setCartModalEventsAttached(false);
    if (onAttachCartModalEvents) {
      onAttachCartModalEvents(modal);
    }
  }

  // 전체선택 체크박스 업데이트
  const selectAllCheckbox = modal.querySelector(".cart-select-all-checkbox");
  if (selectAllCheckbox) {
    const shouldBeChecked = selectedCount > 0 && selectedCount === totalCount;
    if (selectAllCheckbox.checked !== shouldBeChecked) {
      selectAllCheckbox.checked = shouldBeChecked;
    }
    // 전체선택 텍스트 업데이트
    const selectAllLabel = selectAllCheckbox.closest("label");
    if (selectAllLabel) {
      const walker = document.createTreeWalker(selectAllLabel, NodeFilter.SHOW_TEXT, null);
      let textNode;
      while ((textNode = walker.nextNode())) {
        if (textNode.textContent.trim().startsWith("전체선택")) {
          textNode.textContent = `전체선택 (${selectedCount}/${totalCount})`;
          break;
        }
      }
    }
  }

  // 장바구니 개수 업데이트 (헤더)
  const cartTitle = modal.querySelector("h2.text-lg.font-bold.text-gray-900");
  if (cartTitle) {
    if (totalCount > 0) {
      const countSpan = cartTitle.querySelector("span");
      if (countSpan) {
        countSpan.textContent = `(${totalCount}개)`;
      } else {
        const span = document.createElement("span");
        span.className = "text-sm font-medium text-gray-500";
        span.textContent = `(${totalCount}개)`;
        cartTitle.appendChild(span);
      }
    } else {
      // 총 개수가 0이면 개수 표시 제거
      const countSpan = cartTitle.querySelector("span");
      if (countSpan) {
        countSpan.remove();
      }
    }
  }
}

/**
 * 장바구니 아이템 수량을 업데이트합니다.
 * @param {string} productId - 상품 ID
 * @param {Function} onAttachCartModalEvents - 장바구니 모달 이벤트 연결 함수
 */
export function updateCartItemQuantity(productId, onAttachCartModalEvents) {
  if (!state.isCartOpen) {
    return;
  }

  const modal = document.querySelector(".cart-modal");
  if (!modal) {
    return;
  }

  const item = state.cartItems[productId];
  if (!item) {
    return;
  }

  const { product, quantity } = item;
  const lprice = Number(product?.lprice) || 0;
  const itemPrice = lprice * quantity;

  // 수량 입력 필드 업데이트
  const quantityInput = modal.querySelector(`#quantity-input-${productId}`);
  if (quantityInput) {
    quantityInput.value = quantity;
  }

  // 상품 금액 업데이트 (개별 상품의 총 가격)
  const cartItem = modal.querySelector(`.cart-item[data-product-id="${productId}"]`);
  if (cartItem) {
    const priceContainer = cartItem.querySelector(`.flex.flex-col.items-end.gap-2`);
    if (priceContainer) {
      const itemPriceElement = priceContainer.querySelector(`p.text-sm.font-medium.text-gray-900`);
      if (itemPriceElement) {
        const formatPrice = (value) => {
          const numeric = Number(value) || 0;
          return `${numeric.toLocaleString()}원`;
        };
        itemPriceElement.textContent = formatPrice(itemPrice);
      }
    }
  }

  // 하단 섹션 업데이트 (총 금액만)
  updateCartBottomSection(onAttachCartModalEvents);
}

/**
 * 장바구니 아이템을 모달에서 제거합니다.
 * @param {string} productId - 상품 ID
 * @param {Function} onAttachCartModalEvents - 장바구니 모달 이벤트 연결 함수
 * @param {Function} onRenderCartModal - 장바구니 모달 전체 렌더링 함수 (장바구니가 비어있을 때만)
 */
export function removeCartItemFromModal(productId, onAttachCartModalEvents, onRenderCartModal) {
  if (!state.isCartOpen) {
    return;
  }

  const modal = document.querySelector(".cart-modal");
  if (!modal) {
    return;
  }

  // 상품 아이템 제거
  const cartItem = modal.querySelector(`.cart-item[data-product-id="${productId}"]`);
  if (cartItem) {
    cartItem.remove();
  }

  // 장바구니가 비어있으면 모달 전체 재렌더링
  if (Object.keys(state.cartItems).length === 0) {
    if (onRenderCartModal) {
      onRenderCartModal();
    }
    return;
  }

  // 하단 섹션과 선택 정보 업데이트
  updateCartBottomSection(onAttachCartModalEvents);
}
