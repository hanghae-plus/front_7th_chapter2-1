import { getProducts } from "../api/productApi.js";
import { store } from "../store/store.js";
import { useEffect } from "../hooks/useEffect.js";
import { Search } from "../components/Search.js";
import { ProductList } from "../components/ProductList.js";

export const Home = () => {
  const { products, isLoading } = store.getState();

  useEffect(() => {
    if (products.length === 0 && !isLoading) {
      store.setState({ isLoading: true });
      getProducts().then((data) => {
        console.log(data);
        store.setState({ ...data, isLoading: false });
      });
    }
  }, []);

  return /*html*/ `
  <!-- 검색 및 필터 -->
  ${Search()}
  <!-- 상품 목록 -->
  ${ProductList()}
  `;
};
