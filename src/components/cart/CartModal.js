import { cartStore } from "../../stores/cart-store";
import { html } from "../../utils/html";

import { EmptyCart } from "./EmptyCart";
import { CartItem } from "./CartItem";
import { showToast } from "../../utils/toast";
import { Component } from "../../core/component/Component";
import { formatPrice } from "../../utils/format";
import { modalStore } from "../../stores/modal-store";

export class CartModal extends Component {
  setup() {
    this.update = () => this.render();
  }

  formatPrice(price) {
    return formatPrice(price);
  }

  // 수량 증가
  handleIncreaseQuantity(e) {
    const productId = e.target.closest(".quantity-increase-btn").dataset.productId;
    cartStore.addQuantity(productId);
  }

  // 수량 감소
  handleDecreaseQuantity(e) {
    const productId = e.target.closest(".quantity-decrease-btn").dataset.productId;
    cartStore.minusQuantity(productId);
  }

  // 체크박스 클릭
  handleToggleSelectItem(e) {
    const productId = e.target.dataset.productId;
    cartStore.toggleSelectItem(productId);
  }

  // 전체 선택
  handleToggleSelectAll() {
    cartStore.toggleSelectAll();
  }

  // 아이템 삭제
  handleRemoveItem(e) {
    const productId = e.target.dataset.productId;
    cartStore.removeItem(productId);
    showToast({ type: "info", message: "상품이 삭제되었습니다" });
  }

  // 선택한 상품 삭제
  handleRemoveSelectedItems() {
    cartStore.removeSelectedItems();
    showToast({ type: "info", message: "선택된 상품들이 삭제되었습니다" });
  }

  // 장바구니 전체 비우기
  handleClearCart() {
    cartStore.clearCart();
    showToast({ type: "info", message: "장바구니가 비워졌습니다" });
  }

  handleCloseModal(e) {
    // overlay를 직접 클릭한 경우에만 닫기
    if (e.target.classList.contains("cart-modal-overlay")) {
      modalStore.close();
    }

    if (e.target.closest("#cart-modal-close-btn")) {
      modalStore.close();
    }
  }

  setEvents() {
    this.addEventListener("click", ".quantity-increase-btn", this.handleIncreaseQuantity);
    this.addEventListener("click", ".quantity-decrease-btn", this.handleDecreaseQuantity);
    this.addEventListener("click", ".cart-item-remove-btn", this.handleRemoveItem);
    this.addEventListener("change", ".cart-item-checkbox", this.handleToggleSelectItem);
    this.addEventListener("change", '[id="cart-modal-select-all-checkbox"]', this.handleToggleSelectAll);
    this.addEventListener("click", '[id="cart-modal-remove-selected-btn"]', this.handleRemoveSelectedItems);
    this.addEventListener("click", '[id="cart-modal-clear-cart-btn"]', this.handleClearCart);
    this.addEventListener("click", '[id="cart-modal-close-btn"]', this.handleCloseModal);
    this.addEventListener("click", ".cart-modal-overlay", this.handleCloseModal);
  }

  mount(selector) {
    super.mount(selector);
    cartStore.subscribe(this.update);
  }

  unmount() {
    super.unmount();
    cartStore.unsubscribe(this.update);
  }

  template() {
    const cartItems = cartStore.getItems();
    const totalPrice = cartStore.getTotalPrice();
    const selectedCount = cartStore.getSelectedItemsSize();
    const selectedPrice = cartStore.getSelectedItemsPrice();
    const isAllSelected = cartStore.isAllSelected();

    // 빈 장바구니 상태
    if (cartItems.length === 0) {
      return EmptyCart();
    }

    return html`
      <div
        class="flex min-h-full w-full cart-modal-overlay  w-full items-end justify-center p-0 sm:items-center sm:p-4"
      >
        <div
          class="relative bg-white cart-modal rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-l  g max-h-[90vh] overflow-hidden"
        >
          <!-- 헤더 -->
          <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                ></path>
              </svg>
              장바구니
              <span class="text-sm font-normal text-gray-600 ml-1">(${cartItems.length})</span>
            </h2>
            <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <!-- 컨텐츠 -->
          <div class="flex flex-col max-h-[calc(90vh-120px)]">
            <!-- 전체 선택 섹션 -->
            <div class="p-4 border-b border-gray-200 bg-gray-50">
              <label class="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  id="cart-modal-select-all-checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                  ${isAllSelected ? "checked" : ""}
                />
                전체선택 (${cartItems.length}개)
              </label>
            </div>
            <!-- 아이템 목록 -->
            <div class="flex-1 overflow-y-auto">
              <div class="p-4 space-y-4">
                ${cartItems
                  .map((item) => {
                    const isSelected = cartStore.isSelected(item.productId);
                    return CartItem({ item, isSelected });
                  })
                  .join("")}
              </div>
            </div>
          </div>
          <!-- 하단 액션 -->
          <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <!-- 선택된 아이템 정보 -->
            <div class="flex justify-between items-center mb-3 text-sm">
              <span class="text-gray-600">선택한 상품 (${selectedCount}개)</span>
              <span class="font-medium">${this.formatPrice(selectedPrice)}</span>
            </div>
            <!-- 총 금액 -->
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-bold text-gray-900">총 금액</span>
              <span class="text-xl font-bold text-blue-600">${this.formatPrice(totalPrice)}</span>
            </div>
            <!-- 액션 버튼들 -->
            <div class="space-y-2">
              ${selectedCount > 0
                ? html`
                    <button
                      id="cart-modal-remove-selected-btn"
                      class="w-full bg-red-600 text-white py-2 px-4 rounded-md
                       hover:bg-red-700 transition-colors text-sm"
                    >
                      선택한 상품 삭제 (${selectedCount}개)
                    </button>
                  `
                : ""}
              <div class="flex gap-2">
                <button
                  id="cart-modal-clear-cart-btn"
                  class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md
                       hover:bg-gray-700 transition-colors text-sm"
                >
                  전체 비우기
                </button>
                <button
                  id="cart-modal-checkout-btn"
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md
                       hover:bg-blue-700 transition-colors text-sm"
                >
                  구매하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
