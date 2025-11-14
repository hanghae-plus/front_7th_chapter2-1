import { cartStore } from "../../store/cartStore";

export const CartIcon = () => {
  return /*html*/ `
<button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
  </svg>
  ${
    cartStore.getTotalCount() === 0
      ? ""
      : `
  <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
    ${cartStore.getTotalCount()}
  </span>`
  }

</button>`;
};

const subscribeCartIcon = () => {
  cartStore.subscribe(() => {
    const cartIconBtn = document.getElementById("cart-icon-btn");
    if (!cartIconBtn) return false;

    cartIconBtn.innerHTML = CartIcon().trim();
    return true;
  });
};
subscribeCartIcon();
