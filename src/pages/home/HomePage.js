import { CategoryFilter } from "./_components/CategoryFilter";
import { LimitSelect } from "./_components/LimitSelect";
import { SearchBar } from "./_components/SearchBar";
import { SortSelect } from "./_components/SortSelect";
import { Component } from "../../core/component/Component";
import { HomePageLoadingFallback } from "./_components/HomePageLoadingFallback";
import { html } from "../../utils/html";
import { ProductList } from "./_components/ProductList";
import { cartStore } from "../../stores/cart-store";
import { searchParamsStore } from "../../stores/search-params-store";

import { IntersectionObserverWrapper } from "../../core/IntersectionObserver";
import { HomeViewModel } from "./HomeViewModel";
import { HomePageErrorFallback } from "./_components/HomePageErrorFallback";

export class HomePage extends Component {
  setup() {
    this.vm = new HomeViewModel();

    this.state = this.vm.state;

    this.vm.subscribe((newState) => {
      this.state = newState;
      this.render();
    });

    // IntersectionObserver 초기화
    this.observer = new IntersectionObserverWrapper(
      (entries) => {
        const sentinel = entries[0];
        if (sentinel.isIntersecting && this.vm.shouldLoadNextPage()) {
          this.vm.fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    this.useEffect(() => {
      this.vm.init();
      const handleSearchParamsChange = () => this.vm.init();
      const handleRender = () => this.render();

      cartStore.subscribe(handleRender);
      searchParamsStore.subscribe(handleSearchParamsChange);

      return () => {
        cartStore.unsubscribe(handleRender);
        searchParamsStore.unsubscribe(handleSearchParamsChange);
        this.observer?.disconnect();
      };
    }, []);
  }

  observeSentinel() {
    const sentinel = this.$target.querySelector("#load-more-sentinel");
    if (sentinel) {
      this.observer.observe(sentinel);
    }
  }

  render() {
    super.render();
    this.observeSentinel();
    this.renderComponents();
  }

  renderComponents() {
    if (this.state.error) {
      const errorFallback = this.$target.querySelector('[data-component="home-page-error-fallback"]');
      new HomePageErrorFallback(errorFallback, { handleRetry: this.vm.handleRetry.bind(this) });
      return;
    }

    if (this.state.isLoading) {
      const loadingFallback = this.$target.querySelector('[data-component="home-page-loading-fallback"]');
      new HomePageLoadingFallback(loadingFallback);
      return;
    }

    const { category1 = null, category2 = null, limit = 20, sort = "price_asc", search = "" } = searchParamsStore.get();
    const { products, isFetching, pagination } = this.state;
    const { hasNext, total } = pagination;

    const searchBar = this.$target.querySelector('[data-component="home-page-search-bar"]');
    const categoryFilter = this.$target.querySelector('[data-component="home-page-category-filter"]');
    const limitSelect = this.$target.querySelector('[data-component="home-page-limit-select"]');
    const sortSelect = this.$target.querySelector('[data-component="home-page-sort-select"]');
    const productList = this.$target.querySelector('[data-component="home-page-product-list"]');

    new SearchBar(searchBar, { search, onSearch: this.vm.handleSearch.bind(this) });
    new LimitSelect(limitSelect, { limit, onLimitChange: this.vm.handleLimitChange.bind(this) });
    new SortSelect(sortSelect, { sort, onSortChange: this.vm.handleSortChange.bind(this) });

    new CategoryFilter(categoryFilter, {
      category1,
      category2,
      onCategory1Click: this.vm.handleCategory1Click.bind(this),
      onCategory1Filter: this.vm.handleCategory1Filter.bind(this),
      onCategory2Filter: this.vm.handleCategory2Filter.bind(this),
      onResetFilter: this.vm.handleResetFilter.bind(this),
    });

    new ProductList(productList, {
      products,
      isFetching,
      hasNext,
      total,
      onAddToCart: this.vm.handleAddToCart.bind(this),
    });
  }

  template() {
    if (this.state.isLoading) {
      return html`<div data-component="home-page-loading-fallback"></div>`;
    }

    if (this.state.error) {
      return html`<div data-component="home-page-error-fallback"></div>`;
    }

    return html`
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div class="mb-4" data-component="home-page-search-bar"></div>
          <div class="space-y-3">
            <div data-component="home-page-category-filter"></div>
            <div class="flex gap-2 items-center justify-between">
              <div data-component="home-page-limit-select"></div>
              <div data-component="home-page-sort-select"></div>
            </div>
          </div>
        </div>

        <!-- 상품 목록 -->
        <div data-component="home-page-product-list"></div>
        <div id="load-more-sentinel" class="h-10"></div>
      </main>
    `;
  }
}
