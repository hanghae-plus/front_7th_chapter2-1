import { Header } from "./components/Header.js";
import { MainContainer } from "./components/MainContainer.js";
import { SearchBox } from "./components/SearchBox.js";
import { ProductList } from "./components/ProductList.js";
import { Footer } from "./components/Footer.js";

export default function App() {
  return /*html*/ `
    <div class="min-h-screen bg-gray-50"> 
      ${Header()}
      ${MainContainer({
        children: /*html*/ `
          <!-- 검색 및 필터 -->
          ${SearchBox()}
          <!-- 상품 목록 -->
          ${ProductList()}
        `,
      })}
      ${Footer()}
    </div>
  `;
}
