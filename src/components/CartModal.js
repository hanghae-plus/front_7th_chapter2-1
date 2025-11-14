import { CartViewModel } from "../view-models/CartViewModel";
import createComponent from "../core/component/create-component.js";
import CartItem from "./CartItem.js";
import appStore from "../store/app-store.js";
import { showToastMessage } from "../utils/toast-utils.js";
import { TOAST_MESSAGE_MAP } from "../constants/toast-constant.js";
import { formatNumber } from "../utils/formatter.js";
/**
 * @typedef {import('../types.js').CartModalProps} CartModalProps
 * @typedef {import('../types.js').CartItem} CartItem
 */

const CartModal = createComponent({
  id: "cart-modal",
  props: {
    onClose: () => {},
  },
  initialState: () => ({
    cart: appStore.getState().cart,
    allSelected: false,
  }),
  eventHandlers: {
    "cart-modal-close": (props) => {
      props.onClose();
    },
    "cart-modal-overlay-click": (props) => {
      props.onClose();
    },
    "remove-selected-cart-items": (props, getter, setter) => {
      setter("cart", (currentCart) => currentCart.filter((_item) => !_item.isSelected));
      showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
      appStore.setCart(getter("cart").filter((_item) => !_item.isSelected));
    },
    "clear-cart": (props, getter, setter) => {
      setter("cart", []);
      showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
      appStore.removeAllCartItems();
    },
    "select-all-cart-items": (props, getter, setter) => {
      const currentAllSelected = getter("allSelected");
      setter("allSelected", !currentAllSelected);
      setter("cart", (currentCart) => currentCart.map((_item) => ({ ..._item, isSelected: !currentAllSelected })));
      appStore.setAllSelected(!currentAllSelected);
    },
  },
  effects: {
    onMount: ({ props }) => {
      const handleKeyDownEscape = (event) => {
        if (event.key === "Escape") {
          props.onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDownEscape);
      return () => window.removeEventListener("keydown", handleKeyDownEscape);
    },
  },
  templateFn: (_, { cart, allSelected }, setState) => {
    const cartViewModel = new CartViewModel(cart);
    const totalPrice = cart.reduce((acc, _item) => acc + _item.price * _item.count, 0);
    const selectedCart = cart.filter((_item) => _item.isSelected);
    const selectedCartTotalPrice = selectedCart.reduce((acc, _item) => acc + _item.price * _item.count, 0);

    const handleIncreaseQuantity = (productId) => {
      setState("cart", (currentCart) =>
        currentCart.map((_item) =>
          _item.id === productId ? { ..._item, count: Math.min(_item.count + 1, 999) } : _item,
        ),
      );
      appStore.setCart(
        cart.map((_item) => (_item.id === productId ? { ..._item, count: Math.min(_item.count + 1, 999) } : _item)),
      );
    };

    const handleDecreaseQuantity = (productId) => {
      setState("cart", (currentCart) =>
        currentCart.map((_item) =>
          _item.id === productId ? { ..._item, count: Math.max(_item.count - 1, 1) } : _item,
        ),
      );
      appStore.setCart(
        cart.map((_item) => (_item.id === productId ? { ..._item, count: Math.max(_item.count - 1, 1) } : _item)),
      );
    };

    const handleRemoveFromCart = (productId) => {
      setState("cart", (currentCart) => currentCart.filter((_item) => _item.id !== productId));
      appStore.setCart(cart.filter((_item) => _item.id !== productId));
    };

    const handleSelectCartItem = (productId) => {
      setState("cart", (currentCart) =>
        currentCart.map((_item) => (_item.id === productId ? { ..._item, isSelected: !_item.isSelected } : _item)),
      );

      const changedCart = cart.map((_item) =>
        _item.id === productId ? { ..._item, isSelected: !_item.isSelected } : _item,
      );
      if (changedCart.every((_item) => _item.isSelected)) {
        setState("allSelected", true);
        appStore.setAllSelected(true);
      } else {
        setState("allSelected", false);
        appStore.setAllSelected(false);
      }
    };

    return /* HTML */ `
      <div
        class="fixed inset-0 z-50 overflow-y-auto cart-modal"
        data-event="cart-modal-keydown-escape"
        data-event-type="keydown"
      >
        <!-- 배경 오버레이 -->
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"
          data-event="cart-modal-overlay-click"
          data-event-type="click"
        ></div>
        <!-- 모달 컨테이너 -->
        <div id="cart-modal-container" class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden"
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
                ${cartViewModel.getTotalCount() > 0
                  ? /* HTML */ `<span class="text-sm font-normal text-gray-600 ml-1"
                      >(${cartViewModel.getTotalCount()})</span
                    >`
                  : ""}
              </h2>
              <button
                id="cart-modal-close-btn"
                class="text-gray-400 hover:text-gray-600 p-1"
                data-event="cart-modal-close"
                data-event-type="click"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <!-- 컨텐츠 -->
            <div class="flex flex-col max-h-[calc(90vh-120px)]">
              <!-- 전체 선택 섹션 -->
              ${cart.length > 0
                ? /* HTML */ `
                    <div class="p-4 border-b border-gray-200 bg-gray-50">
                      <label class="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          id="cart-modal-select-all-checkbox"
                          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                          ${allSelected ? "checked" : ""}
                          data-event="select-all-cart-items"
                          data-event-type="click"
                        />
                        전체선택 (${cart.length})
                      </label>
                    </div>
                  `
                : ""}
              <!-- 아이템 목록 -->
              ${cart.length > 0
                ? /* HTML */ `
                    <div class="flex-1 overflow-y-auto">
                      <div class="p-4 space-y-4">
                        ${cart
                          .map(
                            (/** @type {CartItem} */ item) =>
                              CartItem.mount({
                                key: item.id,
                                item,
                                handleIncreaseQuantity: (productId) => {
                                  handleIncreaseQuantity(productId);
                                },
                                handleDecreaseQuantity: (productId) => {
                                  handleDecreaseQuantity(productId);
                                },
                                handleRemoveFromCart: (productId) => {
                                  handleRemoveFromCart(productId);
                                  showToastMessage(TOAST_MESSAGE_MAP.REMOVE_SELECTED_CART_ITEMS, "info");
                                },
                                handleSelectCartItem: (productId) => {
                                  handleSelectCartItem(productId);
                                },
                              }).outerHTML,
                          )
                          .join("")}
                      </div>
                    </div>
                  `
                : ""}
              <!-- 하단 액션 -->
              ${cart.length > 0
                ? /* HTML */ `
                    <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                      <!-- 선택된 아이템 정보 -->
                      ${selectedCart.length > 0
                        ? /* HTML */ `
                            <div class="flex justify-between items-center mb-3 text-sm">
                              <span class="text-gray-600">선택한 상품 (${selectedCart.length}개)</span>
                              <span class="font-medium">${formatNumber(selectedCartTotalPrice)}원</span>
                            </div>
                          `
                        : ""}
                      <!-- 총 금액 -->
                      <div class="flex justify-between items-center mb-4">
                        <span class="text-lg font-bold text-gray-900">총 금액</span>
                        <span class="text-xl font-bold text-blue-600">${formatNumber(totalPrice)}원</span>
                      </div>
                      <!-- 액션 버튼들 -->
                      <div class="space-y-2">
                        ${selectedCart.length > 0
                          ? /* HTML */ `
                              <button
                                id="cart-modal-remove-selected-btn"
                                data-event="remove-selected-cart-items"
                                data-event-type="click"
                                class="w-full bg-red-600 text-white py-2 px-4 rounded-md
                                   hover:bg-red-700 transition-colors text-sm"
                              >
                                선택한 상품 삭제 (${selectedCart.length}개)
                              </button>
                            `
                          : ""}
                        <div class="flex gap-2">
                          <button
                            id="cart-modal-clear-cart-btn"
                            data-event="clear-cart"
                            data-event-type="click"
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
                  `
                : ""}
              <!-- 빈 장바구니 -->
              ${cart.length === 0
                ? /* HTML */ `
                    <div class="flex-1 flex items-center justify-center p-8">
                      <div class="text-center">
                        <div class="text-gray-400 mb-4">
                          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                            ></path>
                          </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                        <p class="text-gray-600">원하는 상품을 담아보세요!</p>
                      </div>
                    </div>
                  `
                : ""}
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

export default CartModal;
