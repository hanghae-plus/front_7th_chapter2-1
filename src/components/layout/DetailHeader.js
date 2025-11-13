import { Component } from "../../core/component/Component";
import { cartStore } from "../../stores/cart-store";
import { modalStore } from "../../stores/modal-store";

export class DetailHeader extends Component {
  setup() {
    this.boundRender = () => this.render();

    this.useEffect(() => {
      cartStore.subscribe(this.boundRender);
      return () => {
        cartStore.unsubscribe(this.boundRender);
      };
    }, []);
  }

  setEvents() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("#cart-icon-btn")) {
        modalStore.open("cart");
      }
    });
  }

  template() {
    const cartCount = cartStore.getItemsSize();
    return html`
      <div class="max-w-md mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
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
              ${cartCount > 0
                ? html`
                    <span
                      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >${cartCount}</span
                    >
                  `
                : ""}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
