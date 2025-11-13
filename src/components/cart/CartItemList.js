import { getCartItems } from "../../utils/cartStorage";
import { CartEmpty } from "./CartEmpty";
import { CartItem } from "./CartItem";

/**
 * 장바구니 아이템 목록 컴포넌트
 * @returns {string} 장바구니 아이템 목록 HTML
 */
export const CartItemList = () => {
  const items = getCartItems();

  if (items.length < 1) return CartEmpty();

  // 모든 아이템이 선택되었는지 확인
  const allSelected = items.length > 0 && items.every((item) => item.selected);

  return /* html */ `
    <!-- 전체 선택 섹션 (고정) -->
    <div class="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
      <label class="flex items-center text-sm text-gray-700">
        <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2" ${allSelected ? "checked" : ""}>
        전체선택 (${items.length}개)
      </label>
    </div>
    <!-- 아이템 목록 (스크롤) -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <div class="p-4 space-y-4">
        ${items.map(CartItem).join("")}
      </div>
    </div>
  `;
};
