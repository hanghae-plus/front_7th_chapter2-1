import { getProducts } from '@/api/productApi';
import Component from '@/core/component';
import { navigate } from '@/core/router';

export default class RelatedProducts extends Component {
  setup() {
    this.state = {
      products: [],
    };
    this.fetchProducts();
  }

  async fetchProducts() {
    const { category1, category2, productId } = this.props;
    const { products } = await getProducts({ category1, category2 });
    const filteredProducts = products.filter((product) => product.productId !== productId);

    this.setState({ products: filteredProducts });
  }

  template() {
    const { products } = this.state;

    if (!products.length) return '';
    return /* HTML */ `<div class="bg-white rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
        <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-2 gap-3 responsive-grid">
          ${products
            .map(
              ({ productId, image, title, lprice }) => /* HTML */ `
                <div
                  class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer"
                  data-product-id="${productId}"
                >
                  <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                    <img
                      src="${image}"
                      alt="${title}"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${title}</h3>
                  <p class="text-sm font-bold text-blue-600">
                    ${Number(lprice).toLocaleString()}원
                  </p>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
    </div>`;
  }

  setEvent() {
    this.addEvent('click', '.related-product-card', (e) => {
      const $card = /** @type {HTMLElement} */ (e.target).closest('.related-product-card');
      const { productId } = /** @type {HTMLElement} */ ($card).dataset;

      navigate(`/product/${productId}`);
    });
  }
}
