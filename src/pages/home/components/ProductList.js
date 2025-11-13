import { getProducts } from '@/api/productApi';
import Component from '@/core/component';
import ProductItem from '@/pages/home/components/ProductItem';
import ProductItemSkeleton from '@/pages/home/components/ProductItem.skeleton';
import ProductListLoading from '@/pages/home/components/ProductList.loading';
import { getUrlParams, removeUrlParams, updateUrlParams } from '@/utils/urlParams';

const SKELETON_COUNT = 4;

export default class ProductList extends Component {
  setup() {
    const urlParams = getUrlParams();

    this.state = {
      products: [],
      pagination: null,
      filters: null,
      current: urlParams.current || 1,
      loading: false,
      error: null,
    };
    this.currentFilters = this.getCurrentFilters();
    this.observer = null;
    this.observerTarget = null;
    this.fetchProducts(true);
  }

  getCurrentFilters() {
    const urlParams = getUrlParams();
    return {
      limit: urlParams.limit,
      search: urlParams.search,
      category1: urlParams.category1,
      category2: urlParams.category2,
      sort: /** @type {SortType} */ (urlParams.sort),
    };
  }

  async fetchProducts(reset = false) {
    const newFilters = this.getCurrentFilters();
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(this.currentFilters);
    const shouldReset = reset || filtersChanged;

    if (shouldReset) {
      this.currentFilters = newFilters;
      removeUrlParams(['current']);
      this.setState({
        products: [],
        pagination: null,
        filters: null,
        current: 1,
        loading: true,
        error: null,
      });
    } else {
      if (this.state.loading || !this.state.pagination?.hasNext) return;
      this.setState({ loading: true, error: null });
    }

    try {
      const { products, pagination, filters } = await getProducts({
        ...this.currentFilters,
        current: shouldReset ? 1 : this.state.current,
      });

      this.setState({
        products: shouldReset ? products : [...this.state.products, ...products],
        pagination,
        filters,
        current: pagination.page,
        loading: false,
        error: null,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error?.message || 'Failed to fetch',
      });
    }
  }

  setupIntersectionObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.observerTarget = this.$target.querySelector('[data-observer-target]');
    if (!this.observerTarget) return;

    this.observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const { pagination, current, loading } = this.state;
          if (loading || !pagination?.hasNext) return;

          const nextPage = current + 1;

          updateUrlParams({ current: nextPage });
          this.setState({ current: nextPage });
          this.fetchProducts(false);
        }),
      { threshold: 0.1 }
    );

    this.observer.observe(this.observerTarget);
  }

  template() {
    const { products, pagination, loading, error } = this.state;

    return /* HTML */ `
      <!-- 상품 목록 -->
      <div class="mb-6">
        <div>
          ${error
            ? /* HTML */ `<div class="text-center py-12">
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
                <h3 class="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
                <p class="text-gray-600 mb-4">${error}</p>
                <button
                  id="retry-btn"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>`
            : /* HTML */ `
                ${pagination?.total
                  ? /* HTML */ `
                      <!-- 상품 개수 정보 -->
                      <div class="mb-4 text-sm text-gray-600">
                        총 <span class="font-medium text-gray-900">${pagination.total}개</span>의
                        상품
                      </div>
                    `
                  : ''}
                <!-- 상품 그리드 -->
                ${loading
                  ? /* HTML */ `
                      <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                        ${
                          /* HTML */ `<div data-slot="product-item-skeleton"></div>`.repeat(
                            SKELETON_COUNT
                          )
                        }
                      </div>
                    `
                  : products.length
                    ? /* HTML */ `
                        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
                          ${
                            /* HTML */ `<div data-slot="product-item"></div>`.repeat(
                              products.length
                            )
                          }
                        </div>
                      `
                    : /* HTML */ `
                        <div class="text-center py-12">
                          <div class="text-gray-400 mb-4">
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              ></path>
                            </svg>
                          </div>
                          <h3 class="text-lg font-medium text-gray-900 mb-2">
                            상품을 찾을 수 없습니다
                          </h3>
                          <p class="text-gray-600">다른 검색어를 시도해보세요.</p>
                        </div>
                      `}
                ${products.length
                  ? /* HTML */ `
                      ${!pagination?.hasNext
                        ? /* HTML */ `<div class="text-center py-4 text-sm text-gray-500">
                            모든 상품을 확인했습니다
                          </div>`
                        : loading
                          ? /* HTML */ `<div data-slot="product-list-loading"></div>`
                          : /* HTML */ `<div data-observer-target></div>`}
                    `
                  : ''}
              `}
        </div>
      </div>
    `;
  }

  mounted() {
    const { products } = this.state;
    const $productItems = this.$target.querySelectorAll('[data-slot="product-item"]');
    const $productItemSkeletons = this.$target.querySelectorAll(
      '[data-slot="product-item-skeleton"]'
    );
    const $productListLoading = this.$target.querySelector('[data-slot="product-list-loading"]');

    $productItems.forEach(($productItem, index) => {
      if (products[index]) new ProductItem($productItem, products[index]);
    });
    $productItemSkeletons.forEach(
      ($productItemSkeleton) => new ProductItemSkeleton($productItemSkeleton)
    );
    if ($productListLoading) new ProductListLoading($productListLoading);
    this.setupIntersectionObserver();
  }

  setEvent() {
    this.addEvent('click', '#retry-btn', () => {
      this.setState({ error: null });
      this.fetchProducts(true);
    });
  }
}
