import { getProducts } from "@/api/productApi";
import ProductList from "@/components/product/ProductList";
import { Component } from "@/core/Component";
import Footer from "@components/common/Footer";
import Header from "@components/common/Header";
import Search from "@components/product/Search";

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
    pagination: {},
    filters: {},
    loading: true,
    error: null,
  }),

  children: ({ state, setState, mountChildren }) => {
    // Header와 Footer는 항상 마운트
    mountChildren(Header, "#header");
    mountChildren(Footer, "#footer");
    mountChildren(Search, "#search", {
      pagination: state.pagination,
      filters: state.filters,
      onChangePageLimit: (newPageLimit) => {
        setState({
          ...state,
          pagination: { ...state.pagination, limit: newPageLimit },
        });
      },
      onChangeSort: (newSort) => {
        setState({
          ...state,
          filters: {
            ...state.filters,
            sort: newSort,
          },
        });
      },
      onChangeSearch: (newSearch) => {
        setState({
          ...state,
          filters: {
            ...state.filters,
            search: newSearch,
          },
        });
      },
      onChangeCategory: (category1, category2) => {
        setState({
          ...state,
          filters: {
            ...state.filters,
            category1,
            category2,
          },
        });
      },
    });
    mountChildren(ProductList, "#products-list", {
      products: state.products,
      loading: state.loading,
      pagination: state.pagination,
    });
  },

  onMounted: async ({ state, setState, onStateChange }) => {
    const fetchProducts = async (state, isInitialLoad = false) => {
      try {
        // API 호출
        const { products, pagination } = await getProducts({
          limit: state.pagination.limit,
          ...state.filters,
        });

        // 데이터 로드 완료 후 setState
        // 첫 로드가 아니면 loading은 변경하지 않음 (기존 데이터 유지)
        setState({
          products,
          pagination: {
            limit: state.pagination.limit,
            ...pagination,
          },
          ...(isInitialLoad && { loading: false }),
        });
      } catch (error) {
        console.error("상품 로드 실패:", error);
        setState({
          error: error.message,
          loading: false,
        });
      }
    };

    // 초기 로드
    fetchProducts(state, true);

    // 검색 파라미터가 변경되면 다시 fetch (로딩 없이)
    onStateChange(["filters", "pagination.limit"], ({ state }) => fetchProducts(state, false));
  },
});

export default Home;
