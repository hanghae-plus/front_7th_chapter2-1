import { getCartCount } from "../../utils/cartStorage.js";

/**
 * 헤더 컴포넌트
 * @param {Object} props
 * @param {string} props.type - 헤더 타입 ("default" | "detail")
 * @param {string} props.title - 헤더 타이틀
 */
export const Header = ({ type = "default", title = "쇼핑몰" } = {}) => {
  const cartCount = getCartCount();
  const cartBadge =
    cartCount > 0
      ? `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">${cartCount}</span>`
      : "";

  // 상세 페이지 헤더
  if (type === "detail") {
    return `
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">${title}</h1>
            </div>
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                  ></path>
                </svg>
                ${cartBadge}
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  // 기본 헤더
  return `
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900">
            <a href="/" data-link="">쇼핑몰</a>
          </h1>
          <div class="flex items-center space-x-2">
            <!-- 장바구니 아이콘 -->
            <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                ></path>
              </svg>
              ${cartBadge}
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
};

/**
 * 장바구니 아이콘 개수 업데이트 (DOM 조작)
 * 장바구니 추가/삭제 후 호출하여 실시간 업데이트
 */
export const updateCartIconCount = () => {
  const cartIconBtn = document.getElementById("cart-icon-btn");
  if (!cartIconBtn) return;

  const cartCount = getCartCount();
  const existingBadge = cartIconBtn.querySelector("span");

  if (cartCount > 0) {
    if (existingBadge) {
      // 기존 배지 업데이트
      existingBadge.textContent = cartCount;
    } else {
      // 새 배지 생성
      const badge = document.createElement("span");
      badge.className =
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center";
      badge.textContent = cartCount;
      cartIconBtn.appendChild(badge);
    }
  } else {
    // 장바구니가 비어있으면 배지 제거
    if (existingBadge) {
      existingBadge.remove();
    }
  }
};
