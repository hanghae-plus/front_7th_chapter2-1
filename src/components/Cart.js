import Component from "@/core/Component";
import { cartStore } from "@/core/store";

class Cart extends Component {
  // cartStore의 초기 상태 사용
  initState() {
    return {
      isOpen: cartStore.getState().isOpen,
      items: cartStore.getState().items || [],
      totalCount: cartStore.getState().totalCount || 0,
      totalPrice: cartStore.getState().totalPrice || 0,
    };
  }
  // cartStore 구독하여 상태 동기화
  setup() {
    this.unsubscribe = cartStore.subscribe((newState) => {
      this.setState({
        isOpen: newState.isOpen,
        items: newState.items,
        totalCount: newState.totalCount,
        totalPrice: newState.totalPrice,
      });
    });
  }

  template() {
    const { isOpen, items, totalPrice } = this.state;
    const hasItems = items && items.length > 0;

    return /*html*/ `
    <div class="fixed inset-0 z-50 overflow-y-auto cart-modal" style="display: ${isOpen ? "block" : "none"}">
      <!-- 배경 오버레이 -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
      <!-- 모달 컨테이너 -->
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          <!-- 헤더 -->
          <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
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
          <div class="flex flex-col max-h-[calc(90vh-120px)]">
            ${
              hasItems
                ? `
            <!-- 장바구니 아이템 목록 -->
            <div class="flex-1 overflow-y-auto p-4">
              <div class="space-y-4">
                ${items
                  .map(
                    (item) => `
                <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${item.productId}">
                  <!-- 상품 이미지 -->
                  <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                  </div>
                  <!-- 상품 정보 -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate">${item.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${Number(item.price).toLocaleString()}원</p>
                    <!-- 수량 조절 -->
                    <div class="flex items-center mt-2">
                      <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.productId}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                        </svg>
                      </button>
                      <input type="number" value="${item.quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" data-product-id="${item.productId}">
                      <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.productId}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <!-- 가격 및 삭제 -->
                  <div class="text-right ml-3">
                    <p class="text-sm font-medium text-gray-900">${Number(item.price * item.quantity).toLocaleString()}원</p>
                    <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${item.productId}">삭제</button>
                  </div>
                </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
            <!-- 하단 액션 -->
            <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div class="flex justify-between items-center mb-4">
                <span class="text-lg font-bold text-gray-900">총 금액</span>
                <span class="text-xl font-bold text-blue-600">${Number(totalPrice).toLocaleString()}원</span>
              </div>
              <div class="space-y-2">
                <button id="cart-modal-clear-cart-btn" class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm">
                  전체 비우기
                </button>
                <button id="cart-modal-checkout-btn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                  구매하기
                </button>
              </div>
            </div>
            `
                : `
            <!-- 빈 장바구니 -->
            <div class="flex-1 flex items-center justify-center p-8">
              <div class="text-center">
                <div class="text-gray-400 mb-4">
                  <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                <p class="text-gray-600">원하는 상품을 담아보세요!</p>
              </div>
            </div>
            `
            }
          </div>
        </div>
      </div>
    </div>`;
  }

  setEvent() {
    // 모달 닫기 버튼
    this.addEvent("click", "#cart-modal-close-btn", () => {
      cartStore.closeCart();
    });

    // 배경 오버레이 클릭 시 닫기
    this.addEvent("click", ".cart-modal-overlay", () => {
      cartStore.closeCart();
    });

    // 수량 감소
    this.addEvent("click", ".quantity-decrease-btn", (e) => {
      const productId = e.target.closest("[data-product-id]")?.dataset.productId;
      if (!productId) return;
      const item = this.state.items.find((item) => item.productId === productId);
      if (item) {
        cartStore.updateQuantity(productId, item.quantity - 1);
      }
    });

    // 수량 증가
    this.addEvent("click", ".quantity-increase-btn", (e) => {
      const productId = e.target.closest("[data-product-id]")?.dataset.productId;
      if (!productId) return;
      const item = this.state.items.find((item) => item.productId === productId);
      if (item) {
        cartStore.updateQuantity(productId, item.quantity + 1);
      }
    });

    // 수량 직접 입력
    this.addEvent("change", ".quantity-input", (e) => {
      const productId = e.target.dataset.productId;
      const quantity = parseInt(e.target.value, 10);
      if (productId && quantity > 0) {
        cartStore.updateQuantity(productId, quantity);
      }
    });

    // 상품 삭제
    this.addEvent("click", ".cart-item-remove-btn", (e) => {
      const productId = e.target.dataset.productId;
      if (productId) {
        cartStore.removeItem(productId);
      }
    });

    // 전체 비우기
    this.addEvent("click", "#cart-modal-clear-cart-btn", () => {
      if (confirm("장바구니를 모두 비우시겠습니까?")) {
        cartStore.clearCart();
      }
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

export default Cart;
