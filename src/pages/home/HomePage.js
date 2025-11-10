import { CategoryFilter } from "../../components/filter/CategoryFilter";
import { LimitSelect } from "../../components/filter/LimitSelect";
import { SearchBar } from "../../components/filter/SearchBar";
import { SortSelect } from "../../components/filter/SortSelect";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { getProducts } from "../../api/productApi";
import { BaseComponent } from "../../components/common/BaseComponent";
import { HomePageSkeleton } from "./HomePageSkeleton";
import { html } from "../../utils/html";
import { ProductList } from "../../components/product/ProductList";
import { showToast } from "../../components/common/toast";
const defaultParams = {
  limit: 20,
  search: "",
  category1: "",
  category2: "",
  sort: "price_asc",
  page: 1,
};
export class HomePage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      products: [],
      isLoading: true,
      isFetching: true,
      params: defaultParams,
      hasNext: true,
    };
    this.observer = null;
  }

  async init() {
    try {
      const response = await getProducts(this.state.params);

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
    this.render();
    this.setupInfiniteScroll();
  }

  template() {
    if (this.state.isLoading) {
      return HomePageSkeleton();
    }

    if (this.state.error) {
      return html`
        <div class="bg-gray-50">
          ${Header({ cartCount: 4 })}
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

    const {
      params: { category1, category2, limit, sort },
      products,
      isFetching,
      hasNext,
    } = this.state;

    return html`
      <div class="bg-gray-50">
        ${Header({ cartCount: 4 })}

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

  /** 장바구니 상품 추가 */
  onClickAddToCart(productId) {
    console.log(productId);
    alert("장바구니에 추가되었습니다");
  }

  /** 다음 페이지 데이터 로드 */
  async fetchNextPage() {
    if (this.state.isFetching || !this.state.hasNext) return;

    this.setState({
      isFetching: true,
      params: { ...this.state.params, page: this.state.params.page + 1 },
    });

    const response = await getProducts({ ...this.state.params });

    this.setState({
      products: [...this.state.products, ...response.products],
      hasNext: response.pagination.hasNext,
      isFetching: false,
    });
  }

  setupInfiniteScroll() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const sentinel = entries[0];

        if (sentinel.isIntersecting) {
          const { isLoading, isFetching, hasNext } = this.state;

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

    const sentinel = this.el.querySelector("#load-more-sentinel");

    if (sentinel) {
      this.observer.observe(sentinel);
    }
  }

  mount(selector) {
    super.mount(selector);
    this.init();
  }

  /** 렌더가 발생할 때마다 Observer가 바라보고 있는 요소를 다시 관찰하도록 설정 */
  render() {
    super.render();
    this.setupInfiniteScroll();
  }

  events() {
    // 1. 재시도 이벤트
    this.el.addEventListener("click", (e) => {
      const action = e.target.dataset.action;

      if (action === "retry") {
        this.init();
      }
    });

    // 2. 상품 limit 변경 이벤트
    this.el.addEventListener("change", (e) => {
      if (e.target.id === "limit-select") {
        const limit = e.target.value;

        this.setState({
          params: { ...this.state.params, limit: Number(limit), page: 1 },
        });
        this.init();
      }
    });

    // 3. 상품 sort 변경 이벤트
    this.el.addEventListener("change", (e) => {
      if (e.target.id === "sort-select") {
        const sort = e.target.value;

        this.setState({
          params: { ...this.state.params, sort, page: 1 },
        });
        this.init();
      }
    });
  }
}
