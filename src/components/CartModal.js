import { getCartState, subscribe } from "../store/appStore.js";

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
      <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
        <img src="${image}" alt="${title}" class="w-full h-full object-cover cart-item-image" data-product-id="${id}">
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 truncate cart-item-title" data-product-id="${id}">
          ${title}
        </h4>
        <p class="text-sm text-gray-600 mt-1">${Number(price).toLocaleString()}원</p>
        <div class="flex items-center mt-2 text-xs text-gray-500">
          수량: <span class="ml-1 font-medium">${quantity}</span>
        </div>
      </div>
      <div class="text-right ml-3">
        <p class="text-sm font-medium text-gray-900">${totalPrice.toLocaleString()}원</p>
      </div>
    </div>
  `;
};

const renderCartItems = (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    return EMPTY_VIEW;
  }

  return /*html*/ `
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        ${items.map(renderCartItem).join("")}
      </div>
    </div>
    <div class="border-t border-gray-200 bg-white p-4">
      <button
        type="button"
        class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
        data-cart-checkout
      >
        주문하기
      </button>
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
  contentContainer.innerHTML = renderCartItems(cartState.items);
};

let isSetup = false;

export const setupCartModal = (router) => {
  if (isSetup) {
    return;
  }

  isSetup = true;

  const ensureRendered = () => {
    requestAnimationFrame(updateCartModalContent);
  };

  subscribe(ensureRendered);
  router?.subscribe?.(ensureRendered);

  ensureRendered();
};

export const CartModal = ({ cartProducts = [] } = {}) => {
  const initialItems = getInitialItems(cartProducts);

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
