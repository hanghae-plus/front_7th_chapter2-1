import PageLayout from "./PageLayout";
import SearchForm from "../component/SearchForm";
import ProductList from "../component/ProductList";
import { getProducts } from "../api/productApi";

class State {
  constructor(initState) {
    this.state = initState;
  }
  set(newState, render) {
    this.state = newState;
    render();
  }
  get() {
    return this.state;
  }
}

const HomePage = async (render) => {
  const isLoading = new State(true);
  const products = new State([]);

  const limit = new State("20");
  const sort = new State("price_asc");

  function pageRender() {
    render(
      PageLayout({
        children: () => /*HTML*/ `
         <!-- 검색 및 필터 -->
        ${SearchForm({ isLoading: isLoading.get(), limit: limit.get(), sort: sort.get() })}
         <!-- 상품 목록 -->
        ${ProductList({ isLoading: isLoading.get(), products: products.get() })}
       `,
      }),
    );
  }

  pageRender();

  const getProductsData = async (params) => {
    const productData = await getProducts(params);
    products.set(productData.products, pageRender);
    isLoading.set(false, pageRender);
  };

  await getProductsData();

  document.addEventListener("change", (e) => {
    if (e.target.id === "limit-select") {
      const value = e.target.value;

      getProductsData({ limit: value });
      limit.set(value, pageRender);
    }

    if (e.target.id === "sort-select") {
      const value = e.target.value;

      getProductsData({ sort: value });
      sort.set(value, pageRender);
    }
  });
};

export default HomePage;
