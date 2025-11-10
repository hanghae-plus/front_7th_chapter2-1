// import productStore from "../Store/product.js";
import searchForm from "../components/product/searchForm.js";
import productList from "../components/product/list.js";

// let product = productStore.getState();

export function renderProductList() {
  return `
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          ${searchForm()}
        </div>
        <!-- 상품 목록 -->
        <div class="mb-6">
        ${productList({ list: [], isLoading: false })}
        </div>
      </main>`;
}
