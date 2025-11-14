import { getCartState, subscribe } from "../store/appStore.js";

const updateCartBadge = () => {
  const cartIconButton = document.querySelector("#cart-icon-btn");
  if (!cartIconButton) {
    return;
  }

  let badge = cartIconButton.querySelector("[data-cart-badge]");
  const cartState = getCartState();
  // 장바구니에 담긴 아이템 수 (고유 상품 개수)
  const itemCount = cartState.items.length;

  if (itemCount > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.setAttribute("data-cart-badge", "");
      badge.className =
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
      cartIconButton.appendChild(badge);
    }
    badge.textContent = itemCount > 99 ? "99+" : String(itemCount);
  } else if (badge) {
    badge.remove();
  }
};

let isSetup = false;

export const setupHeader = (router) => {
  if (isSetup) {
    return;
  }

  isSetup = true;

  const ensureUpdated = () => {
    requestAnimationFrame(updateCartBadge);
  };

  subscribe(ensureUpdated);
  router?.subscribe?.(ensureUpdated);

  ensureUpdated();
};

export const Header = (title = "쇼핑몰") => {
  const contentView = /*html*/ `
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900">
            <a href="/" data-link="">${title}</a>
          </h1>
          <div class="flex items-center space-x-2">
            <!-- 장바구니 아이콘 -->
            <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
  return contentView;
};
