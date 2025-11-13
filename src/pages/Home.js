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
    pagination: { limit: 10, page: 1 },
    filters: {},
    loading: true,
    loadingMore: false,
    hasNext: true,
    error: null,
  }),

  children: (context) => {
    const { state, mountChildren } = context;

    // Header와 Footer는 항상 마운트
    mountChildren(Header, "#header");
    mountChildren(Footer, "#footer");

    mountChildren(Search, "#search", {
      pagination: state.pagination,
      filters: state.filters,
      onChangePageLimit: (newPageLimit) => {
        context.setState({
          pagination: { ...state.pagination, limit: newPageLimit },
        });
      },
      onChangeSort: (newSort) => {
        context.setState({
          filters: { ...state.filters, sort: newSort },
        });
      },
      onChangeSearch: (newSearch) => {
        context.setState({
          filters: { ...state.filters, search: newSearch },
        });
      },
      onChangeCategory: (category1, category2) => {
        context.setState({
          filters: { ...state.filters, category1, category2 },
        });
      },
    });

    mountChildren(ProductList, "#products-list", {
      products: state.products,
      loading: state.loading,
      loadingMore: state.loadingMore,
      hasNext: state.hasNext,
      pagination: state.pagination,
      onLoadMore: () => {
        // 다음 페이지 로드
        if (!state.loadingMore && state.hasNext) {
          context.setState({
            loadingMore: true,
            pagination: { ...state.pagination, page: state.pagination.page + 1 },
          });
        }
      },
    });
  },

  setup: async (context) => {
    const { state, setState, onStateChange } = context;
    const router = Router();

    // URL에서 초기 상태 가져오기
    const initializeFromURL = () => {
      const query = router.getQuery();

      const initialFilters = {
        search: query.search || "",
        category1: query.category1 || "",
        category2: query.category2 || "",
        sort: query.sort || "price_asc",
      };

      const initialPagination = {
        limit: parseInt(query.limit) || 10,
        page: 1, // 무한 스크롤이므로 항상 1부터 시작
      };

      return { filters: initialFilters, pagination: initialPagination };
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

      router.updateQuery(queryParams, true); // replace: true로 히스토리 스택에 쌓이지 않음
    };

    const fetchProducts = async (currentState, isInitialLoad = false, isLoadMore = false) => {
      try {
        // API 호출
        const { products, pagination } = await getProducts({
          limit: currentState.pagination.limit,
          page: currentState.pagination.page,
          ...currentState.filters,
        });

        // 데이터 로드 완료 후 setState
        setState({
          products: isLoadMore ? [...currentState.products, ...products] : products,
          pagination: {
            ...currentState.pagination,
            ...pagination,
          },
          hasNext: pagination.hasNext,
          ...(isInitialLoad && { loading: false }),
          ...(isLoadMore && { loadingMore: false }),
        });
      } catch (error) {
        console.error("상품 로드 실패:", error);
        setState({
          error: error.message,
          loading: false,
          loadingMore: false,
        });
      }
    };

    // URL에서 초기 상태 설정
    const { filters, pagination } = initializeFromURL();
    setState({ filters, pagination });

    // 초기 로드
    await fetchProducts({ ...state, filters, pagination }, true, false);

    // 검색 파라미터가 변경되면 다시 fetch (첫 페이지부터) 및 URL 업데이트
    onStateChange(
      (state) => [state.filters, state.pagination.limit],
      ({ state }) => {
        const newState = { ...state, pagination: { ...state.pagination, page: 1 }, products: [] };
        setState({ pagination: { ...state.pagination, page: 1 }, products: [] });

        // URL 업데이트
        updateURL(newState);

        fetchProducts(newState, false, false);
      },
    );

    // 페이지가 변경되면 추가 로드 (URL은 업데이트하지 않음 - 무한 스크롤)
    onStateChange(
      (state) => [state.pagination.page],
      ({ state, prevState }) => {
        if (state.pagination.page > prevState.pagination.page) {
          fetchProducts(state, false, true);
        }
      },
    );
  },
});

export default Home;
