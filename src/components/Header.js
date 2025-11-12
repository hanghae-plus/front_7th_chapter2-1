import Component from "@/core/Component";
import { cartStore } from "@/core/store";

class Header extends Component {
  initState() {
    // cartStore의 초기 상태 사용
    return {
      totalCount: cartStore.getState().totalCount || 0,
    };
  }

  setup() {
    // 부모의 setup 호출 (initState 실행)
    super.setup();

    // 초기 상태를 cartStore와 동기화 (render 전이므로 직접 state 설정)
    const currentState = cartStore.getState();
    this.state.totalCount = currentState.totalCount || 0;

    // cartStore 구독하여 장바구니 개수 업데이트
    this.unsubscribe = cartStore.subscribe((newState) => {
      this.setState({ totalCount: newState.totalCount });
    });
  }

  template() {
    const { totalCount } = this.state;
    return `<header class="bg-white shadow-sm sticky top-0 z-40">
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
            ${totalCount > 0 ? `<span class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">${totalCount}</span>` : ""}
          </button>
        </div>
      </div>
    </div>
  </header>`;
  }

  setEvent() {
    this.addEvent("click", "#cart-icon-btn", () => {
      cartStore.openCart();
    });
  }

  unmount() {
    // cartStore 구독 해제
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    // 부모의 unmount 호출
    super.unmount();
  }
}

export default Header;
