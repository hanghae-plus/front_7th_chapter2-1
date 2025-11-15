import createComponent from "../core/component/create-component.js";
import { formatNumber } from "../utils/formatter.js";

const CartItem = createComponent({
  id: "cart-item",
  props: {
    item: {},
    handleIncreaseQuantity: () => {},
    handleDecreaseQuantity: () => {},
    handleRemoveFromCart: () => {},
    handleSelectCartItem: () => {},
  },
  eventHandlers: {
    "quantity-decrease": (props) => {
      props.handleDecreaseQuantity(props.item.id);
    },
    "quantity-increase": (props) => {
      props.handleIncreaseQuantity(props.item.id);
    },
    "remove-from-cart": (props) => {
      props.handleRemoveFromCart(props.item.id);
    },
    "select-cart-item": (props) => {
      props.handleSelectCartItem(props.item.id);
    },
  },
  templateFn: ({ item }) => {
    return /* HTML */ `
      <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${item.id}">
        <!-- 선택 체크박스 -->
        <label class="flex items-center mr-3">
          <input
            type="checkbox"
            class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded
focus:ring-blue-500"
            ${item.isSelected ? "checked" : ""}
            id="cart-item-checkbox-${item.id}"
            data-product-id="${item.id}"
            data-event="select-cart-item"
            data-event-type="click"
          />
        </label>
        <!-- 상품 이미지 -->
        <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
          <img
            src="${item.image}"
            alt="${item.title}"
            class="w-full h-full object-cover cursor-pointer cart-item-image"
            data-product-id="${item.id}"
          />
        </div>
        <!-- 상품 정보 -->
        <div class="flex-1 min-w-0">
          <h4
            class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title"
            data-product-id="${item.id}"
          >
            ${item.title}
          </h4>
          <p class="text-sm text-gray-600 mt-1">${formatNumber(item.price)}원</p>
          <!-- 수량 조절 -->
          <div class="flex items-center mt-2">
            <button
              class="quantity-decrease-btn w-7 h-7 flex items-center justify-center
border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
              data-product-id="${item.id}"
              data-event="quantity-decrease"
              data-event-type="click"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </button>
            <input
              type="number"
              value="${item.count}"
              min="1"
              class="quantity-input w-12 h-7 text-center text-sm border-t border-b
border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled=""
              data-product-id="${item.id}"
            />
            <button
              class="quantity-increase-btn w-7 h-7 flex items-center justify-center
border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
              data-product-id="${item.id}"
              data-event="quantity-increase"
              data-event-type="click"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>
        <!-- 가격 및 삭제 -->
        <div class="text-right ml-3">
          <p class="text-sm font-medium text-gray-900">${formatNumber(item.price * item.count)}원</p>
          <button
            class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800"
            data-product-id="${item.id}"
            data-event="remove-from-cart"
            data-event-type="click"
          >
            삭제
          </button>
        </div>
      </div>
    `;
  },
});

export default CartItem;
