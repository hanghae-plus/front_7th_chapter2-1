import { getCartState, subscribe, removeCartItem, resetCartState } from "../store/appStore.js";
import { showToast } from "../events/uiEvents.js";

const EMPTY_VIEW = /*html*/ `
  <div class="flex-1 flex items-center justify-center p-8">
    <div class="text-center">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
      <p class="text-gray-600">원하는 상품을 담아보세요!</p>
    </div>
  </div>
`;

const renderCartItem = ({ id, title, price, image, quantity }) => {
  const totalPrice = Number(price) * Number(quantity ?? 1);
  return /*html*/ `
    <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${id}">
      <label class="flex items-center mr-3">
        <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
      focus:ring-blue-500" data-product-id="${id}">
      </label>  
      <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
        <img src="${image}" alt="${title}" class="w-full h-full object-cover cart-item-image" data-product-id="${id}">
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 truncate cart-item-title" data-product-id="${id}">
          ${title}
        </h4>
        <p class="text-sm text-gray-600 mt-1">${Number(price).toLocaleString()}원</p>
        <div class="flex items-center mt-2">
          <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
        border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${id}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <input type="number" value="${quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
      border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="${id}">
          <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
        border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${id}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="text-right ml-3">
        <p class="text-sm font-medium text-gray-900">${totalPrice.toLocaleString()}원</p>
        <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${id}">
          삭제
        </button>
      </div>
    </div>
  `;
};

const calculateTotalPrice = (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    return 0;
  }

  return items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return total + price * quantity;
  }, 0);
};

const renderCartItems = (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    return EMPTY_VIEW;
  }

  const itemCount = items.length;
  const totalPrice = calculateTotalPrice(items);

  return /*html*/ `
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <label class="flex items-center text-sm text-gray-700">
        <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
        전체선택 (${itemCount}개)
      </label>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        ${items.map(renderCartItem).join("")}
      </div>
    </div>
    <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <!-- 선택된 아이템 정보 -->
      <!-- 총 금액 -->
      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-bold text-gray-900">총 금액</span>
        <span id="cart-modal-total-price" class="text-xl font-bold text-blue-600">${totalPrice.toLocaleString()}원</span>
      </div>
      <!-- 액션 버튼들 -->
      <div class="space-y-2">
        <button id="cart-modal-remove-selected-btn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md 
              hover:bg-red-700 transition-colors text-sm hidden">
          선택한 상품 삭제 (0개)
        </button>
        <div class="flex gap-2">
          <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                    hover:bg-gray-700 transition-colors text-sm">
            전체 비우기
          </button>
          <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                    hover:bg-blue-700 transition-colors text-sm">
            구매하기
          </button>
        </div>
      </div>
    </div>
  `;
};

const getInitialItems = (cartProducts = []) => {
  if (Array.isArray(cartProducts) && cartProducts.length) {
    return cartProducts;
  }

  const cartState = getCartState();
  return Array.isArray(cartState?.items) ? cartState.items : [];
};

const updateCartModalContent = () => {
  const cartModal = document.querySelector("#cart-modal");
  if (!cartModal) {
    return;
  }

  const contentContainer = cartModal.querySelector("[data-cart-modal-content]");
  if (!contentContainer) {
    return;
  }

  const cartState = getCartState();
  const itemCount = cartState.items.length;
  const totalPrice = calculateTotalPrice(cartState.items);

  // 장바구니 아이템 개수 업데이트
  const itemCountSpan = cartModal.querySelector("#cart-modal-item-count");
  if (itemCountSpan) {
    itemCountSpan.textContent = itemCount > 0 ? `(${itemCount})` : "";
  }

  // 총금액 업데이트
  const totalPriceSpan = cartModal.querySelector("#cart-modal-total-price");
  if (totalPriceSpan) {
    totalPriceSpan.textContent = `${totalPrice.toLocaleString()}원`;
  }

  contentContainer.innerHTML = renderCartItems(cartState.items);

  // 렌더링 후 총금액 다시 업데이트 (동적으로 생성된 요소에 대해)
  requestAnimationFrame(() => {
    const newTotalPriceSpan = cartModal.querySelector("#cart-modal-total-price");
    if (newTotalPriceSpan) {
      newTotalPriceSpan.textContent = `${totalPrice.toLocaleString()}원`;
    }

    // 선택된 상품 삭제 버튼 초기 상태 업데이트
    updateRemoveSelectedButton();
  });
};

const handleSelectAll = (event) => {
  const selectAllCheckbox = event.target.closest("#cart-modal-select-all-checkbox");
  if (!selectAllCheckbox) {
    return;
  }

  const isChecked = selectAllCheckbox.checked;
  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");

  itemCheckboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;
  });

  // 선택된 상품 삭제 버튼 업데이트
  updateRemoveSelectedButton();
};

const updateRemoveSelectedButton = () => {
  const removeSelectedBtn = document.querySelector("#cart-modal-remove-selected-btn");
  if (!removeSelectedBtn) {
    return;
  }

  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
  const checkedCount = Array.from(itemCheckboxes).filter((cb) => cb.checked).length;

  if (checkedCount > 0) {
    removeSelectedBtn.classList.remove("hidden");
    removeSelectedBtn.textContent = `선택한 상품 삭제 (${checkedCount}개)`;
  } else {
    removeSelectedBtn.classList.add("hidden");
  }
};

const handleItemCheckboxChange = () => {
  const selectAllCheckbox = document.querySelector("#cart-modal-select-all-checkbox");
  if (!selectAllCheckbox) {
    return;
  }

  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
  const checkedCount = Array.from(itemCheckboxes).filter((cb) => cb.checked).length;

  // 모든 아이템이 선택되었으면 전체선택 체크박스도 체크
  selectAllCheckbox.checked = checkedCount === itemCheckboxes.length && itemCheckboxes.length > 0;

  // 선택된 상품 삭제 버튼 업데이트
  updateRemoveSelectedButton();
};

const handleItemRemove = (event) => {
  const removeBtn = event.target.closest(".cart-item-remove-btn");
  if (!removeBtn) {
    return;
  }

  const productId = removeBtn.getAttribute("data-product-id");
  if (!productId) {
    return;
  }

  removeCartItem(productId);

  // Toast 표시
  showToast("info", "선택된 상품들이 삭제되었습니다");
};

const handleRemoveSelected = () => {
  const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
  const checkedCheckboxes = Array.from(itemCheckboxes).filter((cb) => cb.checked);

  if (checkedCheckboxes.length === 0) {
    return;
  }

  // 체크된 상품들의 productId를 가져와서 삭제
  checkedCheckboxes.forEach((checkbox) => {
    const productId = checkbox.getAttribute("data-product-id");
    if (productId) {
      removeCartItem(productId);
    }
  });

  // Toast 표시
  showToast("info", "선택된 상품들이 삭제되었습니다");
};

const handleClearCart = () => {
  resetCartState();

  // Toast 표시
  showToast("info", "선택된 상품들이 삭제되었습니다");
};

let isSetup = false;

export const setupCartModal = (router) => {
  if (isSetup) {
    return;
  }

  isSetup = true;

  const ensureRendered = () => {
    requestAnimationFrame(() => {
      updateCartModalContent();

      // 이벤트 리스너 재바인딩 (동적으로 생성된 요소에 대해)
      const selectAllCheckbox = document.querySelector("#cart-modal-select-all-checkbox");
      if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", handleSelectAll);
        selectAllCheckbox.addEventListener("change", handleSelectAll);
      }

      const itemCheckboxes = document.querySelectorAll(".cart-item-checkbox");
      itemCheckboxes.forEach((checkbox) => {
        checkbox.removeEventListener("change", handleItemCheckboxChange);
        checkbox.addEventListener("change", handleItemCheckboxChange);
      });

      const removeButtons = document.querySelectorAll(".cart-item-remove-btn");
      removeButtons.forEach((button) => {
        button.removeEventListener("click", handleItemRemove);
        button.addEventListener("click", handleItemRemove);
      });

      const removeSelectedBtn = document.querySelector("#cart-modal-remove-selected-btn");
      if (removeSelectedBtn) {
        removeSelectedBtn.removeEventListener("click", handleRemoveSelected);
        removeSelectedBtn.addEventListener("click", handleRemoveSelected);
      }

      const clearCartBtn = document.querySelector("#cart-modal-clear-cart-btn");
      if (clearCartBtn) {
        clearCartBtn.removeEventListener("click", handleClearCart);
        clearCartBtn.addEventListener("click", handleClearCart);
      }
    });
  };

  subscribe(ensureRendered);
  router?.subscribe?.(ensureRendered);

  ensureRendered();
};

export const CartModal = ({ cartProducts = [] } = {}) => {
  const initialItems = getInitialItems(cartProducts);
  const initialItemCount = initialItems.length;

  return /*html*/ `
    <div id="cart-modal" class="cart-modal hidden fixed inset-0 z-50 flex min-h-full items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" aria-hidden="true">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니 
            <span id="cart-modal-item-count" class="text-sm font-normal text-gray-600 ml-1">${initialItemCount > 0 ? `(${initialItemCount})` : ""}</span>
          </h2>
          
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]" data-cart-modal-content>
          ${renderCartItems(initialItems)}
        </div>
      </div>
    </div>
  `;
};
