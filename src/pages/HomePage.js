import { getProducts } from "../api/productApi.js";
import { SearchForm } from "../components/SearchForm.js";
import { ProductList } from "../components/ProductList.js";
import { router } from "../router/index.js";

// 상태 관리 객체
const state = {
  products: [],
  pagination: {},
  loading: true,
  filters: {},

  update(newState) {
    Object.assign(this, newState);
    router.rerender();
  },

  async fetchProducts() {
    this.loading = true;
    router.rerender();

    try {
      const data = await getProducts(this.filters);
      this.update({
        products: data.products,
        pagination: data.pagination,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      this.update({ loading: false });
    }
  },
};

export const HomePage = () => {
  const queryParams = router.getQueryParams();

  const filters = {
    page: parseInt(queryParams.page) || 1,
    limit: parseInt(queryParams.limit) || 20,
    search: queryParams.search || "",
    category1: queryParams.category1 || "",
    category2: queryParams.category2 || "",
    sort: queryParams.sort || "price_asc",
  };

  if (JSON.stringify(state.filters) !== JSON.stringify(filters)) {
    state.filters = filters;
    state.fetchProducts();
  }

  return /* html */ `
    ${SearchForm({ filters: state.filters, pagination: state.pagination })}
    ${ProductList({
      loading: state.loading,
      products: state.products,
      pagination: state.pagination,
    })}
  `;
};
