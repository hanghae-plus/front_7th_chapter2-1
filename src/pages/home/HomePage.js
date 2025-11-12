import { CategoryFilter } from "../../components/filter/CategoryFilter";
import { LimitSelect } from "../../components/filter/LimitSelect";
import { SearchBar } from "../../components/filter/SearchBar";
import { SortSelect } from "../../components/filter/SortSelect";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { getProducts } from "../../api/productApi";
import { Component } from "../../core/component/Component";
import { HomePageSkeleton } from "./HomePageSkeleton";
import { html } from "../../utils/html";
import { ProductList } from "../../components/product/ProductList";
import { showToast } from "../../utils/toast";
import { cartStore } from "../../stores/cart-store";
import { searchParamsStore } from "../../stores/search-params-store";
import { useNavigate } from "../../hooks/useNavigate";

export class HomePage extends Component {
  constructor(props = {}) {
    super(props);
  }

  setup() {
    this.state = {
      products: [],
      isLoading: true,
      isFetching: true,
      pagination: {
        page: 1,
        hasNext: true,
      },
    };

    this.observer = null;
    this.boundRender = () => this.render();
    this.boundInit = () => this.init();
    this.createIntersectionObserver();
    this.navigate = useNavigate();

    this.useEffect(() => {
      cartStore.subscribe(this.boundRender);
      searchParamsStore.subscribe(this.boundRender);
      searchParamsStore.subscribe(this.boundInit);

      return () => {
        cartStore.unsubscribe(this.boundRender);
        searchParamsStore.unsubscribe(this.boundRender);
        searchParamsStore.unsubscribe(this.boundInit);
        this.observer?.disconnect();
      };
    }, []);

    this.useEffect(() => {
      this.init();
    }, []);
  }

  async init() {
    try {
      const { page } = this.state.pagination;
      const response = await getProducts({ ...searchParamsStore.get(), page });

      this.setState({
        products: response.products,
        isLoading: false,
        isFetching: false,
        hasNext: response.pagination.hasNext,
      });
    } catch (e) {
      this.setState({
        isLoading: false,
        isFetching: false,
        hasNext: false,
        error: e,
      });

      showToast({ type: "error", message: "상품을 불러올 수 없습니다" });
    }
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
      pagination: { hasNext },
    } = this.state;

    return html`
      <div class="bg-gray-50">
        ${Header({ cartCount: cartStore.getItemsSize() })}

        <main class="max-w-md mx-auto px-4 py-4">
          <!-- 검색 및 필터 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="mb-4">${SearchBar()}</div>
            <div class="space-y-3">
              ${CategoryFilter({ category1, category2 })}
              <div class="flex gap-2 items-center justify-between">
                ${LimitSelect({ limit })} ${SortSelect({ sort })}
              </div>
            </div>
          </div>

          <!-- 상품 목록 -->
          ${ProductList({ products, isFetching, hasNext })}
        </main>
        ${Footer()}
      </div>
    `;
  }

  /** 다음 페이지 데이터 로드 */
  async fetchNextPage() {
    if (this.state.isFetching || !this.state.pagination.hasNext) return;

    const nextPage = this.state.pagination.page + 1;

    this.setState({
      isFetching: true,
      pagination: { ...this.state.pagination, page: nextPage },
    });

    const response = await getProducts({ ...searchParamsStore.get(), page: nextPage });

    this.setState({
      products: [...this.state.products, ...response.products],
      pagination: { ...this.state.pagination, hasNext: response.pagination.hasNext },
      isFetching: false,
    });
  }

  createIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const sentinel = entries[0];

        if (sentinel.isIntersecting) {
          const {
            isLoading,
            isFetching,
            pagination: { hasNext },
          } = this.state;

          if (hasNext && !isFetching && !isLoading) {
            this.fetchNextPage();
          }
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );
  }

  observeSentinel() {
    if (!this.observer) return;
    const sentinel = this.$target.querySelector("#load-more-sentinel");

    if (!sentinel) return;

    this.observer.observe(sentinel);
  }

  /** 렌더가 발생할 때마다 Observer가 바라보고 있는 요소를 다시 관찰하도록 설정 */
  render() {
    super.render();
    this.observeSentinel();
  }

  setEvents() {
    // 1. 재시도 이벤트
    this.addEventListener("click", '[data-action="retry"]', (e) => {
      const action = e.target.dataset.action;

      if (action === "retry") {
        this.init();
      }
    });

    // 2. 상품 limit 변경 이벤트
    this.addEventListener("change", '[id="limit-select"]', (e) => {
      const limit = Number(e.target.value);

      searchParamsStore.set({ limit });
      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 2. 상품 limit 변경 이벤트
    this.addEventListener("change", '[id="sort-select"]', (e) => {
      const sort = e.target.value;

      searchParamsStore.set({ sort });
      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 3. 상품 sort 변경 이벤트
    this.addEventListener("change", '[id="sort-select"]', (e) => {
      const sort = e.target.value;

      searchParamsStore.set({ sort });
      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 4. 장바구니 상품 추가 이벤트
    this.addEventListener("click", ".add-to-cart-btn", (e) => {
      e.stopPropagation();

      const productId = e.target.dataset.productId;

      const product = this.state.products.find((product) => product.productId === productId);

      if (!product) return;

      cartStore.addItem(product);

      showToast({ type: "success", message: "장바구니에 추가되었습니다" });
    });

    // 5. 검색 이벤트
    this.addEventListener("keydown", '[id="search-input"]', (e) => {
      if (e.key !== "Enter") return;

      const search = e.target.value;

      searchParamsStore.set({ search });

      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 6-1. 카테고리 1Depth 필터 이벤트
    this.addEventListener("click", ".category1-filter-btn", (e) => {
      const category1 = e.target.dataset.category1;

      searchParamsStore.set({ category1 });
      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 6-2. 카테고리 2Depth 필터 이벤트
    this.addEventListener("click", ".category2-filter-btn", (e) => {
      const category2 = e.target.dataset.category2;

      searchParamsStore.set({ category2 });
      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 6-3. 브레드크럼 리셋 클릭 이벤트
    this.addEventListener("click", '[data-breadcrumb="reset"]', () => {
      searchParamsStore.set({ category1: null, category2: null });
      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 6-4. 브레드크럼 1Depth 클릭 이벤트
    this.addEventListener("click", '[data-breadcrumb="category1"]', () => {
      searchParamsStore.set({ category2: null });
      this.setState({
        pagination: { ...this.state.pagination, page: 1 },
      });
    });

    // 7. 상품 클릭 이벤트
    this.addEventListener("click", ".product-card", (e) => {
      if (e.target.closest(".add-to-cart-btn")) return;
      const productId = e.target.closest(".product-card").dataset.productId;

      this.navigate.push(`/product/${productId}`);
    });
  }
}
