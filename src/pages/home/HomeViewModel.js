import { getProducts } from "../../api/productApi";
import { cartStore } from "../../stores/cart-store";
import { searchParamsStore } from "../../stores/search-params-store";
import { showToast } from "../../utils/toast";

export class HomeViewModel {
  constructor() {
    this.state = {
      products: [],
      isLoading: true,
      isFetching: true,
      pagination: {
        page: 1,
        hasNext: true,
        total: 0,
      },
      error: null,
    };

    // 옵저버 패턴으로 View에 상태 변경 알림
    this.observers = [];
  }

  // View 구독
  subscribe(callback) {
    this.observers.push(callback);
  }

  unsubscribe(callback) {
    this.observers = this.observers.filter((observer) => observer !== callback);
  }

  // 상태 변경 시 모든 구독자에게 알림
  notify() {
    this.observers.forEach((callback) => callback(this.state));
  }

  // 상태 업데이트
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  // 초기 데이터 로드
  async init() {
    try {
      const response = await getProducts({
        ...searchParamsStore.get(),
        page: 1,
      });

      this.setState({
        products: response.products,
        isLoading: false,
        isFetching: false,
        error: null,
        pagination: {
          ...response.pagination,
        },
      });
    } catch (error) {
      this.setState({
        isLoading: false,
        isFetching: false,
        error,
      });

      showToast({ type: "error", message: "상품을 불러올 수 없습니다" });
    }
  }

  // 다음 페이지 로드
  async fetchNextPage() {
    if (this.state.isFetching || !this.state.pagination.hasNext) return;

    try {
      const nextPage = this.state.pagination.page + 1;

      this.setState({
        isFetching: true,
        pagination: { ...this.state.pagination, page: nextPage },
      });

      // Model (API) 직접 호출
      const response = await getProducts({
        ...searchParamsStore.get(),
        page: nextPage,
      });

      this.setState({
        products: [...this.state.products, ...response.products],
        pagination: {
          ...response.pagination,
        },
        isFetching: false,
      });
    } catch (error) {
      console.error(error);
      this.setState({ isFetching: false, error });
      showToast({ type: "error", message: "다음 페이지를 불러올 수 없습니다" });
    }
  }

  resetPagination() {
    this.setState({
      pagination: { ...this.state.pagination, page: 1 },
    });
  }

  // 재시도
  handleRetry() {
    this.init();
  }

  // Limit 변경
  handleLimitChange(limit) {
    searchParamsStore.set({ limit });
  }

  // 정렬 변경
  handleSortChange(sort) {
    searchParamsStore.set({ sort });
  }

  // 검색
  handleSearch(search) {
    searchParamsStore.set({ search });
  }

  // 장바구니 추가
  handleAddToCart(productId) {
    const product = this.state.products.find((p) => p.productId === productId);

    if (!product) return false;

    cartStore.addItem(product);
    showToast({ type: "success", message: "장바구니에 추가되었습니다" });
    return true;
  }

  // 카테고리1 필터
  handleCategory1Filter(category1) {
    searchParamsStore.set({ category1 });
  }

  // 카테고리2 필터
  handleCategory2Filter(category2) {
    searchParamsStore.set({ category2 });
  }

  // 필터 리셋
  handleResetFilter() {
    searchParamsStore.set({ category1: null, category2: null });
  }

  // 카테고리1 클릭
  handleCategory1Click() {
    searchParamsStore.set({ category2: null });
  }

  // 다음 페이지 로드 가능 여부 확인 (IntersectionObserver용)
  shouldLoadNextPage() {
    const { isLoading, isFetching, pagination } = this.state;
    return pagination.hasNext && !isFetching && !isLoading;
  }
}
