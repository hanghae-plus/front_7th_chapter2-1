import createComponent from "../core/component/create-component";
import CartModal from "./CartModal";
import Router from "../core/router/index.js";
import appStore from "../store/app-store.js";
const Header = createComponent({
  id: "header",
  props: { isDetailPage: false },
  initialState: () => ({
    cart: appStore.getState().cart,
  }),
  eventHandlers: {
    "open-cart-modal": (props, getter, setter, event) => {
      if (!event.target) return;
      // const $cartModalRoot = document.querySelector("#cart-modal-root");
      // if (!$cartModalRoot) return;
      const $root = document.querySelector("#root");
      $root?.appendChild(
        CartModal.mount({
          onClose: () => {
            const modal = document.querySelector(".cart-modal");
            if (modal) {
              modal.remove();
            }
          },
        }),
      );
    },
    "navigate-back": (props, getter, setter, event) => {
      if (!event.target) return;
      Router.goBack();
    },
  },
  effects: {
    onMount: ({ setState }) => {
      const unsubscribe = appStore.subscribe((state) => {
        setState("cart", state.cart);
      });
      return unsubscribe;
    },
  },
  templateFn: ({ isDetailPage }, { cart }) => {
    const cartItemCount = cart.reduce((acc, item) => acc + item.count, 0);
    return /* HTML */ `
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            ${isDetailPage
              ? /* HTML */ `
                  <div class="flex items-center space-x-3">
                    <button
                      data-link
                      data-go-back
                      data-event="navigate-back"
                      data-event-type="click"
                      class="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 19l-7-7 7-7"
                        ></path>
                      </svg>
                    </button>
                    <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
                  </div>
                `
              : /* HTML */ `
                  <h1 class="text-xl font-bold text-gray-900">
                    <a href="${Router.basePath}" data-link="">쇼핑몰</a>
                  </h1>
                `}
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button
                id="cart-icon-btn"
                data-event="open-cart-modal"
                data-event-type="click"
                class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                  ></path>
                </svg>
                ${cartItemCount > 0
                  ? /* HTML */ `
                      <span
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                        >${cartItemCount}</span
                      >
                    `
                  : /* HTML */ ``}
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
  },
});

export default Header;
