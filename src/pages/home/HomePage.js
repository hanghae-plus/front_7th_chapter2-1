import { CategoryFilter } from "../../components/filter/CategoryFilter";
import { LimitSelect } from "../../components/filter/LimitSelect";
import { SearchBar } from "../../components/filter/SearchBar";
import { SortSelect } from "../../components/filter/SortSelect";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { Component } from "../../core/component/Component";
import { HomePageSkeleton } from "./HomePageSkeleton";
import { html } from "../../utils/html";
import { ProductList } from "../../components/product/ProductList";
import { cartStore } from "../../stores/cart-store";
import { searchParamsStore } from "../../stores/search-params-store";
import { useNavigate } from "../../hooks/useNavigate";
import { HomeViewModel } from "../../viewmodels/HomeViewModel";

export class HomePage extends Component {
  setup() {
    this.observer = null;
    this.vm = new HomeViewModel();
    this.navigate = useNavigate();

    this.state = this.vm.state;

    this.vm.subscribe((newState) => {
      this.state = newState;
      this.render();
    });

    this.createIntersectionObserver();

    this.useEffect(() => {
      this.vm.init();
      const handleSearchParamsChange = () => this.vm.init();
      const handleRender = () => this.render();

      cartStore.subscribe(handleRender);
      searchParamsStore.subscribe(handleRender);
      searchParamsStore.subscribe(handleSearchParamsChange);

      return () => {
        cartStore.unsubscribe(handleRender);
        searchParamsStore.unsubscribe(handleRender);
        searchParamsStore.unsubscribe(handleSearchParamsChange);
        this.observer?.disconnect();
      };
    }, []);
  }

  // 옵저버 생성
  createIntersectionObserver() {
    this.observer = new IntersectionObserver(
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
  }

  // 옵저버 관찰
  observeSentinel() {
    if (!this.observer) return;
    const sentinel = this.$target.querySelector("#load-more-sentinel");

    if (!sentinel) return;

    this.observer.observe(sentinel);
  }

  template() {
    if (this.state.isLoading) {
      return HomePageSkeleton();
    }

    if (this.state.error) {
      return html`
        <div class="bg-gray-50">
          ${Header({ cartCount: 0 })}
          <main class="max-w-md mx-auto px-4 py-4">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">상품을 불러올 수 없습니다</h3>
              <p class="text-gray-600 mb-4">네트워크 연결을 확인하고 다시 시도해주세요.</p>
              <button
                data-action="retry"
                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </div>
          </main>
          ${Footer()}
        </div>
      `;
    }

    const { category1 = null, category2 = null, limit = 20, sort = "price_asc" } = searchParamsStore.get();

    const {
      products,
      isFetching,
      pagination: { hasNext, total },
    } = this.state;

    return html`
      <div class="bg-gray-50">
        ${Header({ cartCount: cartStore.getItemsSize() })}

        <main class="max-w-md mx-auto px-4 py-4">
          <!-- 검색 및 필터 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="mb-4">${SearchBar({ search: searchParamsStore.get().search })}</div>
            <div class="space-y-3">
              ${CategoryFilter({ category1, category2 })}
              <div class="flex gap-2 items-center justify-between">
                ${LimitSelect({ limit })} ${SortSelect({ sort })}
              </div>
            </div>
          </div>

          <!-- 상품 목록 -->
          ${ProductList({ products, isFetching, hasNext, total })}
        </main>
        ${Footer()}
      </div>
    `;
  }

  render() {
    super.render();
    this.observeSentinel();
  }

  setEvents() {
    // 재시도 버튼 클릭 이벤트
    this.addEventListener("click", '[data-action="retry"]', () => this.vm.handleRetry());

    // 장바구니 추가 버튼 클릭 이벤트
    this.addEventListener("click", ".add-to-cart-btn", (e) => this.vm.handleAddToCart(e.target.dataset.productId));

    // 카테고리1 필터 버튼 클릭 이벤트
    this.addEventListener("click", ".category1-filter-btn", (e) =>
      this.vm.handleCategory1Filter(e.target.dataset.category1),
    );

    // 카테고리2 필터 버튼 클릭 이벤트
    this.addEventListener("click", ".category2-filter-btn", (e) =>
      this.vm.handleCategory2Filter(e.target.dataset.category2),
    );

    // 브래드크럼 전체 버튼 클릭 이벤트
    this.addEventListener("click", '[data-breadcrumb="reset"]', () => this.vm.handleResetFilter());

    // 브래드크럼 1depth 카테고리 버튼 클릭 이벤트
    this.addEventListener("click", '[data-breadcrumb="category1"]', () => this.vm.handleCategory1Click());

    // 상품 카드 클릭 이벤트
    this.addEventListener("click", ".product-card", (e) => {
      if (e.target.closest(".add-to-cart-btn")) return;
      const productId = e.target.closest(".product-card").dataset.productId;

      this.navigate.push(`/product/${productId}`);
    });

    // 페이지당 상품 수 변경 이벤트
    this.addEventListener("change", '[id="limit-select"]', (e) => this.vm.handleLimitChange(Number(e.target.value)));

    // 정렬 변경 이벤트
    this.addEventListener("change", '[id="sort-select"]', (e) => this.vm.handleSortChange(e.target.value));

    // 검색 입력 이벤트
    this.addEventListener("keydown", '[id="search-input"]', (e) => {
      if (e.key === "Enter") {
        this.vm.handleSearch(e.target.value);
      }
    });
  }
}
