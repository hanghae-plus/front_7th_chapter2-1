import { getProducts } from "@/api/productApi";
import ProductList from "@/components/product/ProductList";
import { Component } from "@/core/Component";
import Footer from "@components/common/Footer";
import Header from "@components/common/Header";
import Search from "@components/product/Search";
import { Router } from "@/core/Router";

const Home = Component({
  template: () => {
    return /* HTML */ `
      <div class="min-h-screen bg-gray-50">
        <header id="header" class="bg-white shadow-sm sticky top-0 z-40"></header>
        <main class="max-w-md mx-auto px-4 py-4">
          <!-- 검색 및 필터 -->
          <div id="search" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"></div>
          <!-- 상품 목록 -->
          <div id="products-list" class="mb-6"></div>
        </main>
        <footer id="footer" class="bg-white shadow-sm sticky top-0 z-40"></footer>
      </div>
    `;
  },

  initialState: () => ({
    products: [],
    pagination: { limit: 20, page: 1 },
    filters: {},
    loading: true,
    loadingMore: false,
    hasNext: true,
    error: null,
  }),

  children: (context) => {
    const { state, mountChildren, setState } = context;

    // Header와 Footer는 항상 마운트
    mountChildren(Header, "#header");
    mountChildren(Footer, "#footer");

    // Search 컴포넌트
    mountChildren(Search, "#search", {
      pagination: state.pagination,
      filters: state.filters,
      onChangePageLimit: (newPageLimit) => {
        setState({
          pagination: { ...state.pagination, limit: newPageLimit },
        });
      },
      onChangeSort: (newSort) => {
        setState({
          filters: { ...state.filters, sort: newSort },
        });
      },
      onChangeSearch: (newSearch) => {
        setState({
          filters: { ...state.filters, search: newSearch },
        });
      },
      onChangeCategory: (category1, category2) => {
        setState({
          filters: { ...state.filters, category1, category2 },
        });
      },
    });

    // ProductList 컴포넌트
    mountChildren(ProductList, "#products-list", {
      products: state.products,
      loading: state.loading,
      loadingMore: state.loadingMore,
      hasNext: state.hasNext,
      pagination: state.pagination,
      error: state.error,
      onLoadMore: () => {
        if (!state.loadingMore && state.hasNext && !state.error) {
          setState({
            loadingMore: true,
            pagination: { ...state.pagination, page: state.pagination.page + 1 },
          });
        }
      },
      onRetry: () => {
        setState({ error: null, loading: true });
        // setup에서 등록한 fetchProducts가 자동으로 실행됨
      },
    });
  },

  setup: async (context) => {
    const { state, setState, onStateChange } = context;
    const router = Router();

    // ========== Helper Functions ==========

    // URL에서 초기 상태 가져오기
    const initializeFromURL = () => {
      const query = router.getQuery();
      return {
        filters: {
          search: query.search || "",
          category1: query.category1 || "",
          category2: query.category2 || "",
          sort: query.sort || "price_asc",
        },
        pagination: {
          limit: parseInt(query.limit) || 20,
          page: 1,
        },
      };
    };

    // URL 쿼리스트링 업데이트
    const updateURL = (currentState) => {
      const queryParams = {
        ...(currentState.filters.search && { search: currentState.filters.search }),
        ...(currentState.filters.category1 && { category1: currentState.filters.category1 }),
        ...(currentState.filters.category2 && { category2: currentState.filters.category2 }),
        ...(currentState.filters.sort && { sort: currentState.filters.sort }),
        ...(currentState.pagination.limit && { limit: currentState.pagination.limit }),
      };
      router.updateQuery(queryParams, true);
    };

    // 상품 데이터 가져오기
    const fetchProducts = async (currentState, options = {}) => {
      const { isInitialLoad = false, isLoadMore = false } = options;

      try {
        const { products, pagination } = await getProducts({
          limit: currentState.pagination.limit,
          page: currentState.pagination.page,
          ...currentState.filters,
        });

        setState({
          products: isLoadMore ? [...currentState.products, ...products] : products,
          pagination: { ...currentState.pagination, ...pagination },
          hasNext: pagination.hasNext,
          error: null,
          ...(isInitialLoad && { loading: false }),
          ...(isLoadMore && { loadingMore: false }),
        });
      } catch (error) {
        console.error("상품 로드 실패:", error);
        setState({
          error: error.message || "상품을 불러오는데 실패했습니다",
          loading: false,
          loadingMore: false,
        });
      }
    };

    // ========== Initialization ==========

    // URL에서 초기 상태 설정
    const { filters, pagination } = initializeFromURL();
    setState({ filters, pagination });

    // 초기 로드
    await fetchProducts({ ...state, filters, pagination }, { isInitialLoad: true });

    // ========== State Change Listeners ==========

    // 필터 또는 페이지 크기 변경 시 → 첫 페이지부터 다시 로드
    onStateChange(
      (state) => [
        state.filters.search,
        state.filters.category1,
        state.filters.category2,
        state.filters.sort,
        state.pagination.limit,
      ],
      ({ state }) => {
        const newState = {
          ...state,
          pagination: { ...state.pagination, page: 1 },
          products: [],
        };
        // loading: true로 설정해서 IntersectionObserver가 동작하지 않도록
        setState({
          pagination: { ...state.pagination, page: 1 },
          products: [],
          error: null,
          loading: true,
        });
        updateURL(newState);
        fetchProducts(newState, { isInitialLoad: true });
      },
    );

    // 페이지 변경 시 → 추가 로드 (무한 스크롤)
    onStateChange(
      (state) => [state.pagination.page],
      ({ state, prevState }) => {
        if (state.pagination.page > prevState.pagination.page) {
          fetchProducts(state, { isLoadMore: true });
        }
      },
    );
  },
});

export default Home;
