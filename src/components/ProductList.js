import Component from "@/core/Component";
import SearchFilter from "./SearchFilter";
import ProductCard from "./ProductCard";
import { navigateTo } from "../router";
import { getCategories, getProducts } from "../api/productApi";
import { defaultProductState } from "../store/prodcutStore";
import { HomeLoading } from "./loading/HomeLoading";

class ProductList extends Component {
  getInitState() {
    const initState = { ...defaultProductState };
    const urlParams = new URLSearchParams(window.location.search);

    const search = urlParams.get("search") || "";
    const category1 = urlParams.get("category1") || "";
    const category2 = urlParams.get("category2") || "";
    const sort = urlParams.get("sort") || "price_asc";
    const limit = Number(urlParams.get("limit")) || 20;
    const page = Number(urlParams.get("page")) || 1;

    const filters = {
      search,
      category1,
      category2,
      sort,
    };
    initState.pagination.limit = limit;
    initState.pagination.page = page;
    return { ...initState, filters };
  }
  template() {
    const { pagination } = this.state;
    return `
      <main class="max-w-md mx-auto px-4 py-4 pt-[88px]">
      ${
        this.state.isLoading
          ? HomeLoading
          : `
        <section class="search_filter"></section>
        <!-- 상품 목록 -->
        <div class="mb-6">
          <div>
            <!-- 상품 개수 정보 -->
            <div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">${pagination?.total || 0}개</span>의 상품
            </div>
            <!-- 상품 그리드 -->
            <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            </div>
            ${
              this.state.isLoadingMore
                ? `<div class="text-center py-4">
              <div class="inline-flex items-center">
                <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
              </div>
            </div>
              `
                : ""
            }

            <!-- 무한 스크롤 감시 대상 -->
            <div id="observer-target" class="h-10"></div>
            
            ${
              !this.state.pagination.hasNext
                ? `<div class="text-center py-4 text-sm text-gray-500" id="end-message" style="display: none;">
              모든 상품을 확인했습니다
            </div>
          </div>`
                : ""
            }
        </div>
        `
      }
        
      </main>
  `;
  }
  didMount() {
    this.state = { ...defaultProductState };
  }

  setup() {
    this.observer = null; // Intersection Observer 인스턴스
    this.asyncFetchData();
  }

  async asyncFetchData() {
    const { pagination, filters } = this.getInitState();
    const searchParams = {
      page: pagination.page, // 새로운 검색 시 첫 페이지부터
      limit: pagination.limit,
      search: filters.search,
      category1: filters.category1,
      category2: filters.category2,
      sort: filters.sort,
    };
    const [productsRes, categories] = await Promise.all([getProducts(searchParams), getCategories()]);

    this.setState({
      isLoading: false,
      pagination: productsRes.pagination,
      products: productsRes.products, // 새로운 검색 시 기존 상품 목록 교체
      categories,
      filters,
      searchParams,
    });

    // 초기 데이터 로드 후 Observer 설정 및 종료 메시지 업데이트
    this.setupObserver();
  }

  mountProductCards() {
    const $productList = this.$target.querySelector("#products-grid");
    if (!$productList) return;

    // 기존 ProductCard 제거 (render()로 innerHTML이 교체되지만, 자식 컴포넌트는 수동으로 정리)
    const existingCards = this.$childComponents.filter((component) => component instanceof ProductCard);
    existingCards.forEach((card) => {
      if (card.unmount) card.unmount();
    });
    this.$childComponents = this.$childComponents.filter((component) => !(component instanceof ProductCard));

    // 새로운 ProductCard 생성
    this.state?.products?.forEach((product) => {
      const $product = document.createElement("article");
      $productList.appendChild($product);
      const productCardComponent = new ProductCard($product, { product });
      this.addChildComponent(productCardComponent);
    });
  }

  updated() {
    // render 후 자식 컴포넌트 재마운트
    const $searchFilter = this.$target.querySelector(".search_filter");
    if ($searchFilter && !$searchFilter.hasChildNodes()) {
      const searchFilterComponent = new SearchFilter($searchFilter, this.state);
      this.addChildComponent(searchFilterComponent);
    }

    // ProductCard 재마운트
    this.mountProductCards();

    // Intersection Observer 재등록
    this.setupObserver();
  }

  setEvent() {
    this.addEvent("click", "#products-grid", (e) => {
      const el = e.target.closest("[data-product-id]");
      if (!el) return;

      const productId = el.dataset.productId;
      this.goProductPage(productId);
    });

    this.addEvent("click", "#filter_category1", (e) => {
      const el = e.target.closest("[data-category1]");
      if (!el) return;

      const category1 = el.dataset.category1;
      this.updateURL({ category1, category2: "", page: 1 });
      this.handlesearch({ category1 });
    });

    this.addEvent("click", "#filter_category2", (e) => {
      const el = e.target.closest("[data-category2]");
      if (!el) return;

      const category2 = el.dataset.category2;
      this.updateURL({ category2, page: 1 });
      this.handlesearch({ category2 });
    });

    this.addEvent("click", "#category_container", (e) => {
      const el = e.target.closest("[data-breadcrumb]");
      if (!el) return;

      const category = el.dataset.breadcrumb;
      if (category === "reset") {
        this.updateURL({ category1: "", category2: "", page: 1 });
        this.handlesearch({ category1: "", category2: "" });
        return;
      }
      this.updateURL({ category1: category, category2: "", page: 1 });
      this.handlesearch({ category1: category, category2: "" });
    });

    this.addEvent("change", "#limit-select", (e) => {
      const el = e.target.closest("#limit-select") || e.target;
      if (!el || el.id !== "limit-select") return;
      const limit = Number(el.value);
      this.updateURL({ limit, page: 1 });
      this.handlesearch({ limit });
    });

    this.addEvent("change", "#sort-select", (e) => {
      const el = e.target.closest("#sort-select") || e.target;
      if (!el) return;
      const sort = el.value;
      this.updateURL({ sort, page: 1 });
      this.handlesearch({ sort });
    });

    this.addEvent("keydown", "#search-input", (e) => {
      if (e.key !== "Enter") return;
      const el = e.target.closest("#search-input") || e.target;
      if (!el) return;
      const q = el.value;
      this.updateURL({ search: q, page: 1 });
      this.handlesearch({ search: q });
    });
  }

  async handlesearch(params) {
    // 새로운 검색/필터 시 페이지 리셋
    const resetParams = { ...params, page: 1 };
    this.getProducts(resetParams, true); // true = 교체 모드
  }

  async getProducts(params, replace = false) {
    const searchParams = { ...this.state.searchParams, ...params };

    const response = await getProducts(searchParams);

    // replace가 true면 교체, false면 추가 (무한 스크롤)
    const products = replace ? response.products : [...(this.state.products || []), ...response.products];

    const newState = {
      ...response,
      products,
      searchParams,
    };
    this.setState(newState);
    // URL 업데이트는 이벤트 핸들러에서 이미 처리됨
  }

  // 다음 페이지 로드 (무한 스크롤)
  async loadNextPage() {
    // 이미 로딩 중이거나 더 이상 데이터가 없으면 중단
    if (this.state.isLoadingMore || !this.state.pagination?.hasNext) {
      return;
    }

    this.setState({ isLoadingMore: true });

    const nextPage = (this.state.pagination?.page || 1) + 1;
    this.updateURL({ page: nextPage });
    await this.getProducts({ page: nextPage }, false); // false = 추가 모드

    this.setState({ isLoadingMore: false });
  }

  // Intersection Observer 설정
  setupObserver() {
    // 기존 Observer 해제
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // 더 이상 데이터가 없으면 Observer 등록하지 않음
    if (!this.state.pagination?.hasNext) {
      return;
    }

    const target = this.$target.querySelector("#observer-target");
    if (!target) return;

    // Intersection Observer 생성
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 화면에 보이면 다음 페이지 로드
            this.loadNextPage();
          }
        });
      },
      {
        root: null, // 뷰포트 기준
        rootMargin: "0px",
        threshold: 0.3, // 30% 보이면 트리거
      },
    );

    // 감시 시작
    this.observer.observe(target);
  }

  /**
   * URL 파라미터 업데이트 (이벤트 핸들러에서 직접 호출)
   * @param {Object} newParams - 업데이트할 파라미터
   */
  updateURL(newParams) {
    const { filters = {}, pagination = {} } = this.state;

    // 현재 state에서 파라미터 가져오기
    const params = new URLSearchParams();
    const search = newParams.search !== undefined ? newParams.search : filters.search;
    const category1 = newParams.category1 !== undefined ? newParams.category1 : filters.category1;
    const category2 = newParams.category2 !== undefined ? newParams.category2 : filters.category2;
    const sort = newParams.sort !== undefined ? newParams.sort : filters.sort || "price_asc";
    const page = newParams.page !== undefined ? newParams.page : pagination.page || 1;
    const limit = newParams.limit !== undefined ? newParams.limit : pagination.limit || 20;

    // 파라미터 설정
    if (search) params.set("search", search);
    if (category1) params.set("category1", category1);
    if (category2) params.set("category2", category2);
    if (sort !== "price_asc") params.set("sort", sort);
    if (page !== 1) params.set("page", page.toString());
    // limit은 newParams에 명시적으로 전달된 경우 항상 URL에 반영
    if (newParams.limit !== undefined) {
      params.set("limit", limit.toString());
    } else if (limit !== 20) {
      params.set("limit", limit.toString());
    }

    const newURL = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState({}, "", newURL);
  }

  goProductPage(id) {
    navigateTo(`/product/${id}`, { productId: id, products: this.state.products });
  }

  unmount() {
    // Intersection Observer 정리
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    // 부모의 unmount 호출
    super.unmount();
  }
}

export default ProductList;
