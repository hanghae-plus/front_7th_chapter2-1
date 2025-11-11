import { getProducts } from "../api/productApi.js";

/**
 * 옵저버 패턴 상세 내용
 *
 * 관찰 대상 (Subject): Product 클래스의 인스턴스 (최하단에 생성한 productStore)
 *      --> 싱글톤 패턴 활용 (하나의 product 스토어의 인스턴스를 모든 컴포넌트에서 공유하게 하기 위함)
 * 상태 (State): #state (Object)
 * 구독자 목록 (Observers): #observer (Set)
 * 구독 (Subscribe): subscribe() 메서드.
 * 알림 (Notify): #setState()가 호출되면 #notify() 메서드 호출.
 * */

// 초기 state 구조 잡기
const initialState = {
  product: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
  },
  params: {
    page: 1,
    limit: 20,
    sort: "price_asc",
    search: "",
    category1: "",
    category2: "",
  },
};

class Product {
  // 캡슐화
  #state;
  #observer;

  constructor() {
    this.#state = initialState;
    this.#observer = new Set();
  }

  getState() {
    return structuredClone(this.#state);
  }

  #setState(val) {
    // TODO : 가능하다면 프록시 패턴 적용시켜보자!
    this.#state = { ...this.#state, ...val };
    // 구독자에게 변화 감지 + 리렌더링 함수 실행
    this.#notify();
  }

  #notify() {
    console.log("데이터 변화 감지!");
    this.#observer.forEach((callback) => callback());
  }
  /**
   * 옵저버 생성 (구독자/컴포넌트 추가)
   * @param {function} callback 옵저버의 리렌더링 함수
   * @return {function} 옵저빙 취소 함수 제공 (옵저버 패턴 해제 로직)
   * */
  subscribe(callback) {
    this.#observer.add(callback);
    console.log("Product 스토어 구독자 추가!", callback);
    return () => this.unsubscribe;
  }

  /**
   * 옵저버 삭제 (구독 취소)
   * @param {function} callback 옵저버의 리렌더링 함수(observer Set데이터에서 삭제)
   * */
  unsubscribe(callback) {
    this.#observer.delete(callback);
  }

  /**
   * 상품 목록을 가져오기
   * page === 1 : 상품 목록 새로고침
   * page > 1 : 기존 상품 목록에 추가 (무한 스크롤)
   * 줌
   */
  async fetchProducts() {
    // 이미 로딩 중이면 중복 요청 방지
    if (this.#state.loading) return;

    console.log("fetchProducts! 상품 목록 가져오기!");

    this.#setState({ loading: true, error: null });

    try {
      const params = this.#state.params;
      const data = await getProducts(params); // 실제 API 호출

      // 1페이지면 새로고침, 그 외에는 기존 목록에 추가
      const newProducts = params.page === 1 ? data.products : [...this.#state.products, ...data.products];

      // 로딩 완료 상태로 변경 (상품 목록, 페이지네이션 정보 업데이트)
      this.#setState({
        loading: false,
        products: newProducts,
        pagination: data.pagination,
      });
    } catch (err) {
      this.#setState({ loading: false, error: err.message });
    }
  }

  /**
   * 파라미터 변경 (검색어, 정렬, 개수)
   * 파라미터가 변경되면 page = 1 /  상품 목록을 새로 호출.
   * @param {object} newParams - 변경할 파라미터 (예: { search: '가방' })
   */
  setParams(newParams) {
    // page: 1로 리셋하고, products도 비워줌
    const updatedParams = { ...this.#state.params, ...newParams, page: 1 };

    this.#setState({
      params: updatedParams,
      products: [], // 기존 목록 초기화 (1페이지부터 재호출)
      pagination: initialState.pagination, // 페이지네이션 정보 초기화
    });

    // 새 파라미터로 상품 목록을 다시 불러옵니다.
    this.fetchProducts();
  }

  /**
   * 다음 페이지를 가져오기 (무한 스크롤용)
   */
  fetchNextPage() {
    const { loading, pagination } = this.#state;
    // 로딩 중이거나, 다음 페이지가 없으면(isLast) 실행하지 않습니다.
    if (loading || !pagination.hasNext) {
      return;
    }

    // 현재 페이지 + 1
    const nextParams = { ...this.#state.params, page: pagination.page + 1 };

    // fetchProducts 호출
    this.#setState({ params: nextParams });
    this.fetchProducts();
  }
}

/**
 * 싱긅톤 패턴 적용
 * --> 하나의 product 스토어 객체를 모든 컴포넌트에서 공유하게 하기 위함
 * */
const productStore = new Product();
export default productStore;
