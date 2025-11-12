import Store from "../Store.js";

/**
 * 상품 목록 및 검색/필터 상태 관리 Store
 * - 검색어, 카테고리, 정렬, 페이지네이션 상태 관리
 * - URL 파라미터와 양방향 동기화
 */
class ProductStore extends Store {
  constructor() {
    // 초기 상태 (URL에서 로드)
    super({
      search: "",
      category1: "",
      category2: "",
      sort: "price_asc",
      page: 1,
      limit: 20,
    });

    // URL에서 초기 상태 로드
    this.initFromURL();
  }

  /**
   * URL 파라미터로부터 상태 초기화
   */
  initFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search") || "";
    const category1 = urlParams.get("category1") || "";
    const category2 = urlParams.get("category2") || "";
    const sort = urlParams.get("sort") || "price_asc";
    const page = parseInt(urlParams.get("page") || "1", 10);
    const limit = parseInt(urlParams.get("limit") || "20", 10);

    this.setState({ search, category1, category2, sort, page, limit });
  }

  /**
   * 상태를 URL 파라미터로 동기화
   */
  syncToURL() {
    const params = new URLSearchParams();
    const { search, category1, category2, sort, page, limit } = this.state;

    if (search) params.set("search", search);
    if (category1) params.set("category1", category1);
    if (category2) params.set("category2", category2);
    if (sort !== "price_asc") params.set("sort", sort);
    if (page !== 1) params.set("page", page.toString());
    if (limit !== 20) params.set("limit", limit.toString());

    const newURL = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.pushState({}, "", newURL);
  }

  /**
   * 검색어 설정 (페이지 리셋)
   */
  setSearch(search) {
    this.setState({ search, page: 1 });
    this.syncToURL();
  }

  /**
   * 카테고리1 설정 (카테고리2 및 페이지 리셋)
   */
  setCategory1(category1) {
    this.setState({ category1, category2: "", page: 1 });
    this.syncToURL();
  }

  /**
   * 카테고리2 설정 (페이지 리셋)
   */
  setCategory2(category2) {
    this.setState({ category2, page: 1 });
    this.syncToURL();
  }

  /**
   * 정렬 설정 (페이지 리셋)
   */
  setSort(sort) {
    this.setState({ sort, page: 1 });
    this.syncToURL();
  }

  /**
   * 페이지 설정
   */
  setPage(page) {
    this.setState({ page });
    this.syncToURL();
  }

  /**
   * 개수 설정 (페이지 리셋)
   */
  setLimit(limit) {
    this.setState({ limit, page: 1 });
    this.syncToURL();
  }

  /**
   * 필터 리셋
   */
  resetFilters() {
    this.setState({
      search: "",
      category1: "",
      category2: "",
      sort: "price_asc",
      page: 1,
      limit: 20,
    });
    this.syncToURL();
  }

  /**
   * 검색 파라미터 객체 반환 (API 호출용)
   */
  getSearchParams() {
    const { search, category1, category2, sort, page, limit } = this.state;
    return {
      search,
      category1,
      category2,
      sort,
      page,
      limit,
    };
  }
}

// 싱글톤 인스턴스 생성 및 export
export const productStore = new ProductStore();
