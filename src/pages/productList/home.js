import { ProductList, SearchBox } from "./components/index.js";

export const Home = () => {
  return `<main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        ${SearchBox(false)}
        <!-- 상품 목록 -->
        ${ProductList(false)}
      </main>`;
};
