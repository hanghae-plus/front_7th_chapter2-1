import { CartItem } from "./CartItem";

export const EmptyCart = () => `
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
`;

const CartModalWholeSelect = ({ count }) => {
  return /*HTML*/ `     
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <label class="flex items-center text-sm text-gray-700">
            <input type="checkbox" id="cart-modal-select-all-checkbox" data-action="cart-select-all" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
            전체선택 (${count}개)
          </label>
        </div>`;
};

const CartItemList = ({ items }) => {
  return items.map((item) => CartItem({ item })).join("");
};

const CartModalExistContent = ({ items }) => {
  return /*HTML*/ `
      <div class="flex flex-col max-h-[calc(90vh-120px)]">
          ${CartModalWholeSelect({ count: items.length })}
        <!-- 아이템 목록 -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 space-y-4">
              ${CartItemList({ items })}
          </div>
        </div>
      </div>`;
};

export const CartModalContent = ({ items = [] }) => {
  if (!items.length) {
    return EmptyCart();
  }
  return CartModalExistContent({ items });
};
