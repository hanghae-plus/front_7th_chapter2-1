import { ProductList } from "../components/product/ProductList";
import { SearchForm } from "../components/search/SearchForm";
import { PageLayout } from "./PageLayout";
import { getProducts, getCategories } from "../api/productApi";

export async function HomePage() {
  const $root = document.querySelector("#root");
  let state = {
    filters: { search: "", category1: "", category2: "", sort: "price_asc" },
    pagination: { page: 1, limit: 20 },
    products: [],

    categories: {},
    selectedMain: null,
    selectedSub: null,

    loading: true,
  };

  function setState(newState) {
    state = { ...state, ...newState };
    render();
  }

  async function loadPage() {
    await loadCategories();
    await loadProducts();
  }

  async function loadProducts() {
    const response = await getProducts(state.filters, state.pagination);
    setState({
      ...state,
      products: response.products,
      pagination: response.pagination,
      loading: false,
    });
  }

  async function loadCategories() {
    const response = await getCategories();
    console.log(response);
    setState({ categories: response });
  }

  function render() {
    const { loading, categories, selectedMain, selectedSub, products } = state;

    $root.innerHTML = PageLayout(); // main-view가 비어있는 상태로 렌더링

    const $mainContentView = document.querySelector("#main-content-view");

    const $searchForm = SearchForm({ loading, categories, selectedMain, selectedSub });
    const $ProductList = ProductList({ loading, products });

    $mainContentView.append($searchForm, $ProductList);
  }
  render();
  loadPage();
}
