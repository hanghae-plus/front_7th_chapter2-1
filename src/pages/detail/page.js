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
    // TODO: 로딩 상태 처리 필요
    this.state = {
      product: null,
    };
    this.fetchProduct();
  }

  // TODO: API 에러 처리 필요
  async fetchProduct() {
    const { id } = this.props.params;

    try {
      const product = await getProduct(id);

      if (!product.productId) {
        this.setState({ product: null });
        throw new Error('Product not found');
      }

      this.setState({ product });
    } catch (error) {
      console.error('Error fetching product:', error);
      this.setState({ product: null });
    }
  }

  template() {
    const { product } = this.state;

    return /* HTML */ `<main class="max-w-md mx-auto px-4 py-4">
      ${product
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
            <div class="bg-white rounded-lg shadow-sm">
              <div class="p-4 border-b border-gray-200">
                <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
                <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
              </div>
              <div class="p-4">
                <div data-slot="related-products"></div>
              </div>
            </div>
          `
        : /* HTML */ `<div data-slot="product-loading"></div>`}
    </main>`;
  }

  mounted() {
    const { product } = this.state;
    const $breadcrumb = this.$target.querySelector('[data-slot="breadcrumb"]');
    const $starRating = this.$target.querySelector('[data-slot="star-rating"]');
    const $productOptions = this.$target.querySelector('[data-slot="product-options"]');
    const $relatedProducts = this.$target.querySelector('[data-slot="related-products"]');
    const $productLoading = this.$target.querySelector('[data-slot="product-loading"]');

    if (product) {
      const { category1, category2, rating, productId } = product;
      new Breadcrumb($breadcrumb, { category1, category2 });
      new StarRating($starRating, { rating });
      new ProductOptions($productOptions, { product });
      new RelatedProducts($relatedProducts, { category1, category2, productId });
    } else {
      new ProductLoading($productLoading);
    }
  }

  setEvent() {
    this.addEvent('click', '.go-to-product-list', () => {
      navigate('/');
    });
  }
}
