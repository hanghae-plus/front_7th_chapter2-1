import Component from '@/core/component';
import { addItem, cartStore } from '@/stores/cart';
import { openToast, toastStore } from '@/stores/toast';

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 107;

export default class ProductOptions extends Component {
  setup() {
    this.state = {
      quantity: 1,
    };
  }

  template() {
    const { quantity } = this.state;
    const { product } = this.props;

    return /* HTML */ `
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-gray-900">수량</span>
          <div class="flex items-center">
            <button
              id="quantity-decrease"
              class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 12H4"
                ></path>
              </svg>
            </button>
            <input
              type="number"
              id="quantity-input"
              value="${quantity}"
              min="${MIN_QUANTITY}"
              max="${MAX_QUANTITY}"
              class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 
                          focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              id="quantity-increase"
              class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        <!-- 액션 버튼 -->
        <button
          id="add-to-cart-btn"
          data-product-id="${product.productId}"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          장바구니 담기
        </button>
      </div>
    `;
  }

  setEvent() {
    this.addEvent('click', '#quantity-decrease', () => {
      const { quantity } = this.state;
      this.setState({ quantity: Math.max(quantity - 1, MIN_QUANTITY) });
    });
    this.addEvent('click', '#quantity-increase', () => {
      const { quantity } = this.state;
      this.setState({ quantity: Math.min(quantity + 1, MAX_QUANTITY) });
    });
    this.addEvent('change', '#quantity-input', ({ target }) => {
      let value = parseInt(/** @type {HTMLInputElement} */ (target).value, 10);

      if (isNaN(value)) value = MIN_QUANTITY;
      this.setState({ quantity: Math.min(Math.max(value, MIN_QUANTITY), MAX_QUANTITY) });
    });
    this.addEvent('click', '#add-to-cart-btn', () => {
      const { quantity } = this.state;
      const { title, image, lprice, productId } = this.props.product;

      cartStore.dispatch(addItem({ title, image, lprice, productId, quantity, checked: false }));
      toastStore.dispatch(openToast({ type: 'success', message: '장바구니에 추가되었습니다' }));
    });
  }
}
