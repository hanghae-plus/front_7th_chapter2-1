import Component from "@/core/Component";
import SearchFilter from "./SearchFilter";
import ProductCard from "./ProductCard";
import { navigateTo } from "../router";
import { getProducts } from "../api/productApi";
import { defaultProductState } from "../store/prodcutStore";

class ProductList extends Component {
  initState() {
    return this.getInitState();
  }
  getInitState() {
    const initState = { ...defaultProductState };
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search") || "";
    const category1 = urlParams.get("category1") || "";
    const category2 = urlParams.get("category2") || "";
    const sort = urlParams.get("sort") || "price_asc";
    const page = urlParams.get("search ") || 1;
    const limit = urlParams.get("limit") || 20;
    return { ...initState, page, limit, search, category1, category2, sort };
  }
  template() {
    console.log("state ::", this.state);
    const { pagination } = this.state;
    return `
      <main class="max-w-md mx-auto px-4 py-4">
        <section class="search_filter"></section>
        <!-- 상품 목록 -->
        <div class="mb-6">
          <div>
            <!-- 상품 개수 정보 -->
            <div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">${pagination?.total || 0}개</span>의 상품
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

  setup() {
    this.getProducts();
  }

  mountProductCards() {
    const $productList = this.$target.querySelector("#products-grid");
    if (!$productList) return;

    // // 기존 ProductCard 제거
    // $productList.innerHTML = "";

    // 새로운 ProductCard 생성
    this.state?.products?.forEach((product) => {
      const $product = document.createElement("article");
      $productList.appendChild($product);
      const productCardComponent = new ProductCard($product, { product });
      this.addChildComponent(productCardComponent);
    });
  }

  updated() {
    // render 후 자식 컴포넌트 재마운트
    const $searchFilter = this.$target.querySelector(".search_filter");
    if ($searchFilter && !$searchFilter.hasChildNodes()) {
      const searchFilterComponent = new SearchFilter($searchFilter);
      this.addChildComponent(searchFilterComponent);
    }

    // ProductCard 재마운트
    this.mountProductCards();
  }

  setEvent() {
    this.addEvent("click", "#products-grid", (e) => {
      const el = e.target.closest("[data-product-id]");
      if (!el) return;

      const productId = el.dataset.productId;
      this.goProductPage(productId);
    });
  }

  async getProducts() {
    const products = await getProducts();
    this.setState(products);
  }

  goProductPage(id) {
    navigateTo(`/products/${id}`, { productId: id });
  }
}

export default ProductList;
