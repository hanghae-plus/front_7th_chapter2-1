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

  const search = new State("");

  function pageRender() {
    render(
      PageLayout({
        children: () => /*HTML*/ `
         <!-- 검색 및 필터 -->
        ${SearchForm({ isLoading: isLoading.get(), limit: limit.get(), sort: sort.get(), search: search.get() })}
         <!-- 상품 목록 -->
        ${ProductList({ isLoading: isLoading.get(), products: products.get() })}
       `,
      }),
    );
  }

  pageRender();

  const getProductsData = async (params) => {
    isLoading.set(true, pageRender);
    const productData = await getProducts(params);
    products.set(productData.products, pageRender);
    isLoading.set(false, pageRender);
  };

  await getProductsData();

  document.addEventListener("change", (e) => {
    // 상품수
    if (e.target.id === "limit-select") {
      const value = e.target.value;

      getProductsData({ limit: value });
      limit.set(value, pageRender);
    }

    // 정렬
    if (e.target.id === "sort-select") {
      const value = e.target.value;

      getProductsData({ sort: value });
      sort.set(value, pageRender);
    }
  });

  // 검색
  addEventListener("keydown", (e) => {
    if (e.target.id === "search-input" && e.key === "Enter") {
      const value = e.target.value;
      getProductsData({ search: value });
      search.set(value, pageRender);
    }
  });
};

export default HomePage;
