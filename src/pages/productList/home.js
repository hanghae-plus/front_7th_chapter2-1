import { getProducts as fetchProducts } from "../../api/productApi.js";
import { ProductList, SearchBox } from "./components/index.js";
import { createSignal } from "../../store/signal.js";

/**
 * @typedef {Object} ProductListType
 * @property {Filter} filters
 * @property {Pagination} pagination
 * @property {Product[]} products
 */

// Signal 생성: [getter, setter, subscribe]
const [getLoading, setLoading, subscribeLoading] = createSignal(true);
const [getProducts, setProducts, subscribeProducts] = createSignal([]);

// loading 변경 시 SearchBox만 리렌더링
subscribeLoading((loading) => {
  const searchContainer = document.querySelector("#search-box-container");
  if (searchContainer) {
    searchContainer.innerHTML = SearchBox(loading);
  }
});

// loading 또는 products 변경 시 ProductList 리렌더링
subscribeLoading((loading) => {
  const productsContainer = document.querySelector("#products-grid");
  if (productsContainer) {
    productsContainer.outerHTML = ProductList(loading, getProducts());
  }
});

subscribeProducts((products) => {
  const productsContainer = document.querySelector("#products-grid");
  if (productsContainer) {
    productsContainer.outerHTML = ProductList(getLoading(), products);
  }
});

// 데이터 로드
async function loadData() {
  try {
    const productList = await fetchProducts();
    setProducts(productList.products);
    setLoading(false);
  } catch (error) {
    console.error("Failed to load products:", error);
    setLoading(false);
  }
}

export const Home = () => {
  // DOM 마운트 후 데이터 로드
  setTimeout(() => {
    loadData();
  }, 0);

  // 초기 UI 반환
  return `<main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div id="search-box-container">
          ${SearchBox(true)}
        </div>
        <!-- 상품 목록 -->
        ${ProductList(true, [])}
      </main>`;
};
