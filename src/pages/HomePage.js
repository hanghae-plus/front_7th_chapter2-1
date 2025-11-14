import PageLayout from "../layouts/PageLayout";
import ProductList from "../components/ProductList";
import createComponent from "../core/component/create-component";
import { HOME_PAGE_LOADING } from "../constants/component-constant";
const HomePage = createComponent({
  id: "home-page",
  props: {
    loading: false,
    productListResponse: null,
    categories: [],
    cart: [],
  },
  initialState: (props) => ({
    products: props.productListResponse?.products,
    pagination: props.productListResponse?.pagination,
    filters: props.productListResponse?.filters,
    categories: [],
    cart: [],
  }),
  templateFn: ({ loading, categories = [], cart = [] }, { products, pagination, filters }, setState) => {
    return PageLayout.mount({
      children: loading
        ? HOME_PAGE_LOADING
        : ProductList.mount({
            products,
            pagination,
            filters,
            categories,
            handleSetSort: (value) => {
              setState("filters", (currentFilters) => ({ ...currentFilters, sort: value }));
            },
            handleSetLimit: (value) => {
              setState("pagination", (currentPagination) => ({ ...currentPagination, limit: value }));
            },
            handleSetSearch: (value) => {
              setState("filters", (currentFilters) => ({ ...currentFilters, search: value }));
            },
            handleSetSelectedCategory1: (value) => {
              setState("filters", (currentFilters) => ({ ...currentFilters, category1: value }));
            },
            handleSetSelectedCategory2: (value) => {
              setState("filters", (currentFilters) => ({ ...currentFilters, category2: value }));
            },
          }).outerHTML,
      cart,
    }).outerHTML;
  },
});

export default HomePage;
