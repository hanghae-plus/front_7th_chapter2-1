import { cartStore } from "../../store/cartStore.js";
import { EmptyCart } from "./EmptyCart.js";

const CART_LIST_CONTAINER_ID = "cart-list-container";
let cleanupCartList = null;

const cartItem = ({ productId, title, image, lprice, quantity = 1 }) => /*html*/ `
<div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${productId}">
  <label class="flex items-center mr-3">
    <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" data-product-id="${productId}">
  </label>

  <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
    <img src="${image}" alt="${title}" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="${productId}">
  </div>

  <div class="flex-1 min-w-0">
    <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="${productId}">
      ${title}
    </h4>
    <p class="text-sm text-gray-600 mt-1">${Number(lprice).toLocaleString()}원</p>

    <div class="flex items-center mt-2">
      <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${productId}">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
        </svg>
      </button>
      <input type="number" value="${quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled data-product-id="${productId}">
      <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${productId}">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>
    </div>
  </div>
</div>`;

const renderCartLayout = (cartProducts = []) => {
  const products = Array.isArray(cartProducts) ? cartProducts : [];
  if (products.length === 0) return EmptyCart;

  return /*html*/ `
<div class="p-4 border-b border-gray-200 bg-gray-50">
  <label class="flex items-center text-sm text-gray-700">
    <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
    전체선택 (${products.length}개)
  </label>
</div>

<div class="flex-1 overflow-y-auto">
  <div class="p-4 space-y-4">
    ${products.map((product) => cartItem(product)).join("")}
  </div>
</div>

<div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
  <div id="cart-selected-amount" class="flex justify-between items-center mb-3 text-sm" style="display:none">
    <span class="text-gray-600">선택한 상품 (0개)</span>
    <span class="font-medium">0원</span>
  </div>


  <div class="flex justify-between items-center mb-4">
    <span class="text-lg font-bold text-gray-900">총 금액</span>
    <span class="text-xl font-bold text-blue-600">${Number(cartStore.getTotalAmount()).toLocaleString()}원</span>
  </div>

  <div class="space-y-2">
    <button id="cart-modal-remove-selected-btn" style="display:none" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm">
      선택한 상품 삭제 (0개)
    </button>
    <div class="flex gap-2">
      <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm">
        전체 비우기
      </button>
      <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
        구매하기
      </button>
    </div>
  </div>
</div>
`;
};

const updateCartListView = (cartProducts = []) => {
  const container = document.getElementById(CART_LIST_CONTAINER_ID);
  if (!container) return false;

  if (!container.isConnected) {
    destroyCartList();
    return false;
  }

  container.innerHTML = renderCartLayout(cartProducts);
  return true;
};

const mountCartList = () => {
  destroyCartList();
  const mounted = updateCartListView(cartStore.state.cart);
  if (!mounted) return false;

  const unsubscribe = cartStore.subscribe((cartProducts) => {
    updateCartListView(cartProducts);
  });

  cleanupCartList = () => {
    unsubscribe();
    cleanupCartList = null;
  };
};

const scheduleCartListMount = () => {
  if (typeof window === "undefined") return;

  window.requestAnimationFrame(() => {
    if (!mountCartList()) {
      window.setTimeout(mountCartList, 0);
    }
  });
};

export const destroyCartList = () => {
  if (cleanupCartList) {
    cleanupCartList();
  }
};

export const CartList = () => {
  scheduleCartListMount();

  return /*html*/ `
<div id="${CART_LIST_CONTAINER_ID}" class="flex flex-col max-h-[calc(90vh-120px)] overflow-hidden">
  ${renderCartLayout(cartStore.state.cart)}
</div>
`;
};
