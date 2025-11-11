import Component from "@/core/Component";
import SearchFilter from "./SearchFilter";
import ProductCard from "./ProductCard";
import { navigateTo } from "../router";
import { getProducts } from "../api/productApi";

class ProductList extends Component {
  initState() {
    return {
      products: [],
      categories: {},
      isLoading: false,
      isLoadingMore: false,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
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

  mounted() {
    console.log("render!!");
    const $searchFiler = document.querySelector(".search_filter");
    new SearchFilter($searchFiler);
    const $productList = document.querySelector("#products-grid");
    this.state?.products.map((product) => {
      const $product = document.createElement("article");
      $productList.appendChild($product);
      new ProductCard($product, { product });
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

  async getProducts() {
    console.log(123);
    const products = await getProducts();
    this.setState(products);
  }

  goProductPage(id) {
    navigateTo(`/products/${id}`, { productId: id });
  }
}

export default ProductList;
