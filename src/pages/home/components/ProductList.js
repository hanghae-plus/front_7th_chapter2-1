import { getProducts } from '@/api/productApi';
import Component from '@/core/component';
import ProductItem from '@/pages/home/components/ProductItem';
import ProductItemSkeleton from '@/pages/home/components/ProductItem.skeleton';
import ProductListLoading from '@/pages/home/components/ProductList.loading';

const SKELETON_COUNT = 4;

export default class ProductList extends Component {
  setup() {
    const params = new URLSearchParams(location.search);

    this.state = {
      products: [],
      pagination: null,
      filters: null,
      current: params.get('current') ? Number(params.get('current')) : 1,
      loading: false,
    };
    this.currentFilters = this.getCurrentFilters();
    this.observer = null;
    this.observerTarget = null;
    this.fetchProducts(true);
  }

  getCurrentFilters() {
    const params = new URLSearchParams(location.search);

    return {
      limit: params.get('limit') ? Number(params.get('limit')) : undefined,
      search: params.get('search') || undefined,
      category1: params.get('category1') || undefined,
      category2: params.get('category2') || undefined,
      sort: /** @type {SortType} */ (params.get('sort')) || undefined,
    };
  }

  // TODO: API 에러 처리 필요
  async fetchProducts(reset = false) {
    const newFilters = this.getCurrentFilters();
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(this.currentFilters);
    const shouldReset = reset || filtersChanged;

    if (shouldReset) {
      this.currentFilters = newFilters;
      const url = new URL(location.href);
      url.searchParams.delete('current');
      history.replaceState({}, '', url.toString());
      this.setState({
        products: [],
        pagination: null,
        filters: null,
        current: 1,
        loading: true,
      });
    } else {
      if (this.state.loading || !this.state.pagination?.hasNext) return;
      this.setState({ loading: true });
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
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      this.setState({ loading: false });
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

          const url = new URL(location.href);
          const nextPage = current + 1;

          url.searchParams.set('current', nextPage.toString());
          history.replaceState({}, '', url.toString());
          this.setState({ current: nextPage });
          this.fetchProducts(false);
        }),
      { threshold: 0.1 }
    );

    this.observer.observe(this.observerTarget);
  }

  template() {
    const { products, pagination, loading } = this.state;

    return /* HTML */ `
      <!-- 상품 목록 -->
      <div class="mb-6">
        <div>
          ${pagination?.total
            ? /* HTML */ `
                <!-- 상품 개수 정보 -->
                <div class="mb-4 text-sm text-gray-600">
                  총 <span class="font-medium text-gray-900">${pagination.total}개</span>의 상품
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
                    ${/* HTML */ `<div data-slot="product-item"></div>`.repeat(products.length)}
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
                    <h3 class="text-lg font-medium text-gray-900 mb-2">상품을 찾을 수 없습니다</h3>
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
}
