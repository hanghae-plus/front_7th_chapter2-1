import { Component } from "@/core/Component";
import { Router } from "@/core/Router";
import CartModal, { cartStore } from "@/components/common/CartModal";

const ProductPageHeader = Component({
  initialState: () => ({
    cartCount: 0,
  }),

  template: ({ state }) => {
    return /* HTML */ `
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button id="back-btn" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
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
                ${state.cartCount > 0
                  ? /* HTML */ `
                      <span
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        ${state.cartCount}
                      </span>
                    `
                  : ""}
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
  },

  setup: ({ setState }) => {
    // 초기 장바구니 개수 설정
    setState({ cartCount: CartModal.getItemCount() });

    // 장바구니 상태 구독
    const unsubscribe = cartStore.subscribe((state) => {
      setState({ cartCount: state.items.length });
    });

    // cleanup
    return unsubscribe;
  },

  setEvent: ({ addEvent }) => {
    const router = Router();

    // 뒤로가기 버튼
    addEvent("#back-btn", "click", () => {
      router.push("/");
    });

    // 장바구니 버튼 클릭
    addEvent("#cart-icon-btn", "click", () => {
      CartModal.show();
    });
  },
});

export default ProductPageHeader;
