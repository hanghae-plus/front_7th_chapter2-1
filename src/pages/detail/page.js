import { getProduct } from '@/api/productApi';
import Component from '@/core/component';
import { navigate } from '@/core/router';
import Breadcrumb from '@/pages/detail/components/Breadcrumb';
import ProductLoading from '@/pages/detail/components/Product.loading';
import ProductOptions from '@/pages/detail/components/ProductOptions';
import RelatedProducts from '@/pages/detail/components/RelatedProducts';
import StarRating from '@/pages/detail/components/StarRating';

export default class DetailPage extends Component {
  setup() {
    this.state = {
      product: null,
      loading: true,
      error: null,
    };
    this.fetchProduct();
  }

  async fetchProduct() {
    const { id } = this.props.params;

    this.setState({ loading: true, error: null });

    try {
      const product = await getProduct(id);

      if (!product.productId) {
        throw new Error('Product not found');
      }

      this.setState({ product, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching product:', error);
      this.setState({
        product: null,
        loading: false,
        error: error?.message || 'Failed to fetch',
      });
    }
  }

  template() {
    const { product, loading, error } = this.state;

    return /* HTML */ `<main class="max-w-md mx-auto px-4 py-4">
      ${error
        ? /* HTML */ `
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
              <div class="text-center">
                <div class="text-red-500 mb-4">
                  <svg
                    class="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
                <h1 class="text-xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</h1>
                <p class="text-gray-600 mb-4">${error}</p>
                <button
                  onclick="window.history.back()"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
                >
                  이전 페이지
                </button>
                <a
                  id="home-link"
                  href="/"
                  data-link=""
                  class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  홈으로
                </a>
              </div>
            </div>
          `
        : loading
          ? /* HTML */ `<div data-slot="product-loading"></div>`
          : product
            ? /* HTML */ `
                <!-- 브레드크럼 -->
                <div data-slot="breadcrumb"></div>
                <!-- 상품 상세 정보 -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                  <!-- 상품 이미지 -->
                  <div class="p-4">
                    <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src="${product.image}"
                        alt="${product.title}"
                        class="w-full h-full object-cover product-detail-image"
                      />
                    </div>
                    <!-- 상품 정보 -->
                    <div>
                      <p class="text-sm text-gray-600 mb-1">${product.brand || product.maker}</p>
                      <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
                      <!-- 평점 및 리뷰 -->
                      <div class="flex items-center mb-3">
                        <div data-slot="star-rating"></div>
                        <span class="ml-2 text-sm text-gray-600"
                          >${product.rating}.0 (${product.reviewCount}개 리뷰)</span
                        >
                      </div>
                      <!-- 가격 -->
                      <div class="mb-4">
                        <span class="text-2xl font-bold text-blue-600"
                          >${Number(product.lprice).toLocaleString()}원</span
                        >
                      </div>
                      <!-- 재고 -->
                      <div class="text-sm text-gray-600 mb-4">재고 ${product.stock}개</div>
                      <!-- 설명 -->
                      <div class="text-sm text-gray-700 leading-relaxed mb-6">
                        ${product.description}
                      </div>
                    </div>
                  </div>
                  <!-- 수량 선택 및 액션 -->
                  <div data-slot="product-options"></div>
                </div>
                <!-- 상품 목록으로 이동 -->
                <div class="mb-6">
                  <button
                    class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md 
                    hover:bg-gray-200 transition-colors go-to-product-list"
                  >
                    상품 목록으로 돌아가기
                  </button>
                </div>
                <!-- 관련 상품 -->
                <div data-slot="related-products"></div>
              `
            : ''}
    </main>`;
  }

  mounted() {
    const { product, loading } = this.state;

    if (loading) {
      const $productLoading = this.$target.querySelector('[data-slot="product-loading"]');
      new ProductLoading($productLoading);
      return;
    }

    if (product) {
      const { category1, category2, rating, productId } = product;
      const $breadcrumb = this.$target.querySelector('[data-slot="breadcrumb"]');
      const $starRating = this.$target.querySelector('[data-slot="star-rating"]');
      const $productOptions = this.$target.querySelector('[data-slot="product-options"]');
      const $relatedProducts = this.$target.querySelector('[data-slot="related-products"]');

      new Breadcrumb($breadcrumb, { category1, category2 });
      new StarRating($starRating, { rating });
      new ProductOptions($productOptions, { product });
      new RelatedProducts($relatedProducts, { category1, category2, productId });
    }
  }

  setEvent() {
    this.addEvent('click', '#home-link', (e) => {
      e.preventDefault();
      navigate('/');
    });
    this.addEvent('click', '.go-to-product-list', () => {
      navigate('/');
    });
    this.addEvent('click', '#retry-btn', () => {
      this.fetchProduct();
    });
  }
}
