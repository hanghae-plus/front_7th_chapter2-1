import { ProductList } from "../components/product/ProductList";
import { SearchForm } from "../components/search/SearchForm";
import { PageLayout } from "./PageLayout";
import { getProducts, getCategories } from "../api/productApi";
import { store } from "../store/store";

export const HomePage = () => {
  const $root = document.querySelector("#root");

  const loadPage = async () => {
    await loadCategories();
    await loadProducts();
  };

  const loadProducts = async () => {
    const filters = {};

    const response = await getProducts(filters);
    store.setState({
      products: response.products,
      pagination: response.pagination,
      loading: false,
    });
  };

  async function loadCategories() {
    const response = await getCategories();
    store.setState({ categories: response });
  }

  const render = () => {
    $root.innerHTML = PageLayout(); // main-view가 비어있는 상태로 렌더링

    const $mainContentView = document.querySelector("#main-content-view");

    const $searchForm = SearchForm();
    const $ProductList = ProductList();

    $mainContentView.append($searchForm, $ProductList);
  };
  render();
  loadPage();
};
