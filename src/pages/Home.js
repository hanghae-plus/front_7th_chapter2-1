import { getProducts } from "../api/productApi.js";
import { store } from "../store/store.js";
import { useEffect } from "../hooks/useEffect.js";
import { Search } from "../components/Search.js";
import { ProductList } from "../components/ProductList.js";

export const Home = () => {
  const { products, isLoading, isError } = store.getState();

  useEffect(() => {
    if (products.length === 0 && !isLoading) {
      store.setState({ isLoading: true });
      getProducts()
        .then((data) => {
          store.setState({ ...data, isLoading: false });
        })
        .catch(() => {
          store.setState({ isError: true, isLoading: false, toast: { isOpen: true, type: "error" } });
        });
    }
  }, []);

  return /*html*/ `
  <!-- 검색 및 필터 -->
  ${Search()}
  <!-- 상품 목록 -->
  ${
    isError
      ? /*html*/ `
      <div class="text-center py-8">
      <div class="text-600 mb-4">오류가 발생했습니다.</div>
      <button id="retry-fetch-btn" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">다시 시도</button>
      </div>`
      : ProductList()
  }
  `;
};
