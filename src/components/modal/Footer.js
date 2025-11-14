import { carts, selectedItems } from "./core";

export const CartFooter = () => {
  const selectedItemsInfo = carts.filter((cart) => selectedItems.has(cart.productId));

  return html`
    <!-- 선택된 아이템 정보 -->
    <div class="flex justify-between items-center mb-3 text-sm">
      <span class="text-gray-600">선택한 상품 (${selectedItems.size}개)</span>
      <span class="font-medium"
        >${Number(
          selectedItemsInfo.reduce((acc, cart) => acc + Number(cart.lprice) * cart.quantity, 0),
        ).toLocaleString()}원</span
      >
    </div>
    <!-- 총 금액 -->
    <div class="flex justify-between items-center mb-4">
      <span class="text-lg font-bold text-gray-900">총 금액</span>
      <span class="text-xl font-bold text-blue-600"
        >${Number(
          selectedItemsInfo.reduce((acc, cart) => acc + Number(cart.lprice) * cart.quantity, 0),
        ).toLocaleString()}원</span
      >
    </div>
    <!-- 액션 버튼들 -->
    <div class="space-y-2">
      <button
        id="cart-modal-remove-selected-btn"
        class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm"
      >
        선택한 상품 삭제 (${selectedItems.size}개)
      </button>
      <div class="flex gap-2">
        <button
          id="cart-modal-clear-cart-btn"
          class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm"
        >
          전체 비우기
        </button>
        <button
          id="cart-modal-checkout-btn"
          class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          구매하기
        </button>
      </div>
    </div>
  `;
};
