import PageLayout from "./PageLayout";
import SearchForm from "../component/SearchForm";
import ProductList from "../component/ProductList";
import { getProducts } from "../api/productApi";

const HomePage = async () => {
  // TODO: 이렇게 되면 loading이 항상 false가 되지 않나?
  let isLoading = true;
  const { products } = await getProducts();
  isLoading = false;

  return PageLayout({
    children: () => /*html*/ `
     <!-- 검색 및 필터 -->
    ${SearchForm({ isLoading })}
     <!-- 상품 목록 -->
    ${ProductList({ isLoading, products })}
   `,
  });
};

export default HomePage;
