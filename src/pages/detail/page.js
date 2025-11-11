import { getProduct } from '@/api/productApi';
import Component from '@/core/component';
import { navigate } from '@/core/router';

// TODO: 컴포넌트 정리!!
export default class DetailPage extends Component {
  setup() {
    this.state = {
      loading: true,
      product: null,
      quantity: 1,
    };
    this.fetchProductDetails();
  }

  async fetchProductDetails() {
    const { id } = this.props.params;
    try {
      const product = await getProduct(id);
      if (product.error) {
        throw new Error(product.error);
      }
      this.setState({ loading: false, product });
    } catch (error) {
      console.error('Failed to fetch product:', error);
      this.setState({ loading: false, product: null });
    }
  }

  template() {
    return /* HTML */ ` ${this.renderContent()} `;
  }

  renderContent() {
    if (this.state.loading || !this.state.product) {
      return /* HTML */ `
        <main class="max-w-md mx-auto px-4 py-4">
          <div class="py-20 bg-gray-50 flex items-center justify-center">
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
              ></div>
              <p class="text-gray-600">상품 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
      `;
    }

    const { product, quantity } = this.state;
    return /* HTML */ `
      <main class="max-w-md mx-auto px-4 py-4">
        <div>
          <div class="bg-white rounded-lg shadow-sm mb-6">
            <div class="p-4">
              <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src="${product.image}"
                  alt="${product.title}"
                  class="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
                <div class="mb-4">
                  <span class="text-2xl font-bold text-blue-600"
                    >${Number(product.lprice).toLocaleString()}원</span
                  >
                </div>
              </div>
            </div>
            <div class="border-t border-gray-200 p-4">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-gray-900">수량</span>
                <div class="flex items-center">
                  <button
                    id="quantity-decrease"
                    class="w-8 h-8 flex items-center justify-center border rounded-l-md"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity-input"
                    value="${quantity}"
                    class="w-16 h-8 text-center border-t border-b"
                    readonly
                  />
                  <button
                    id="quantity-increase"
                    class="w-8 h-8 flex items-center justify-center border rounded-r-md"
                  >
                    +
                  </button>
                </div>
              </div>
              <button id="add-to-cart-btn" class="w-full bg-blue-600 text-white py-3 rounded-md">
                장바구니 담기
              </button>
            </div>
          </div>
          <button class="go-to-product-list block w-full text-center bg-gray-100 py-3 rounded-md">
            상품 목록으로 돌아가기
          </button>
        </div>
      </main>
    `;
  }

  setEvent() {
    this.addEvent('click', '#quantity-increase', () => {
      this.setState({ quantity: this.state.quantity + 1 });
    });

    this.addEvent('click', '#quantity-decrease', () => {
      if (this.state.quantity > 1) {
        this.setState({ quantity: this.state.quantity - 1 });
      }
    });

    this.addEvent('click', '#add-to-cart-btn', () => {
      console.log('Add to cart:', this.state.product.productId, 'Quantity:', this.state.quantity);
    });

    this.addEvent('click', '.go-to-product-list', () => {
      navigate('/');
    });
  }
}
