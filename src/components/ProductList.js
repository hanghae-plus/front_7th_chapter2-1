import Component from "@/core/Component";
import SearchFilter from "./SearchFilter";
import ProductCard from "./ProductCard";
import { navigateTo } from "../router";

class ProductList extends Component {
  template() {
    return `
      <main class="max-w-md mx-auto px-4 py-4">
        <section class="search_filter"></section>
        <!-- 상품 목록 -->
        <div class="mb-6">
          <div>
            <!-- 상품 개수 정보 -->
            <div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">340개</span>의 상품
            </div>
            <!-- 상품 그리드 -->
            <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            </div>
            
            <div class="text-center py-4 text-sm text-gray-500">
              모든 상품을 확인했습니다
            </div>
          </div>
        </div>
      </main>
  `;
  }

  mount() {
    const $searchFiler = document.querySelector(".search_filter");
    new SearchFilter($searchFiler);

    const $productList = document.querySelector("#products-grid");
    [1, 2, 3].map((v) => {
      const $product = document.createElement("article");
      $productList.appendChild($product);
      new ProductCard($product, { prodcutId: v });
    });
  }

  setEvent() {
    this.addEvent("click", "#products-grid", (e) => {
      const el = e.target.closest("[data-product-id]");
      if (!el) return;

      const productId = el.dataset.productId;
      this.goProductPage(productId);
    });
  }

  goProductPage(id) {
    navigateTo(`/products/${id}`);
  }
}

export default ProductList;
