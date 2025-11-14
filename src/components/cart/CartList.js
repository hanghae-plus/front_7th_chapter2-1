import CartItem from "./CartItem.js";

export default function CartList(items) {
  const totalItemsCount = items.length;
  const isAllItemsChecked = totalItemsCount > 0 && items.every((item) => item.isChecked);

  return `
    <!-- 전체 선택 섹션 -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <label class="flex items-center text-sm text-gray-700">
        <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2" ${isAllItemsChecked ? "checked" : ""}>
        전체선택 (${totalItemsCount}개)
      </label>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        ${items.map((item) => CartItem(item)).join("")}
      </div>
    </div>
  `;
}
