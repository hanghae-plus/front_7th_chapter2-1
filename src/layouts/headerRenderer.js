import { cartStore } from "../Store/cart.js";
import { cartModalControl } from "../utils/cartEventListeners.js";

/**
 * 헤더 렌더링
 */
export function renderHeader() {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) {
    console.error("header-container 없음");
    return;
  }

  // 장바구니 아이템 개수 업데이트
  const { items } = cartStore.getState();
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  headerContainer.innerHTML = `
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
              </svg>
              ${
                totalQuantity > 0
                  ? `
                <span id="cart-count-badge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  ${totalQuantity}
                </span>
              `
                  : ""
              }
            </button>
          </div>
        </div>
      </div>
    </header>
  `;

  // 헤더가 다시 렌더링될 때마다 모달 컨트롤 이벤트를 다시 부착
  cartModalControl();
}

// cartStore 구독: 장바구니 상태 변경 시 헤더를 다시 렌더링하여 아이템 개수를 업데이트
cartStore.subscribe(renderHeader);
