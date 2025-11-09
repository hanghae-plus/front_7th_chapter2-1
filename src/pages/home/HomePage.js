import { CategoryFilter } from "../../components/filter/CategoryFilter";
import { LimitSelect } from "../../components/filter/LimitSelect";
import { SearchBar } from "../../components/filter/SearchBar";
import { SortSelect } from "../../components/filter/SortSelect";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { getProducts } from "../../api/productApi";
import { BaseComponent } from "../../components/common/BaseComponent";
import { HomePageSkeleton } from "./HomePageSkeleton";
import { html } from "../../utils/html";
import { ProductList } from "../../components/product/ProductList";

export class HomePage extends BaseComponent {
  constructor(props = {}) {
    super(props);
    this.state = {
      products: [],
      pagination: {},
      filters: {},
      mainCategory: null,
      subCategory: null,
      isLoading: true,
    };
  }

  async init() {
    const response = await getProducts();

    this.setState({
      products: response.products,
      pagination: response.pagination,
      filters: response.filters,
      mainCategory: response.filters.category1,
      subCategory: response.filters.category2,
      isLoading: false,
    });
    this.render();
  }

  template() {
    if (this.state.isLoading) {
      return HomePageSkeleton();
    }

    const { mainCategory, subCategory, products } = this.state;

    return html`
      <div class="bg-gray-50">
        ${Header({ cartCount: 4 })}

        <main class="max-w-md mx-auto px-4 py-4">
          <!-- 검색 및 필터 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div class="mb-4">${SearchBar()}</div>
            <div class="space-y-3">
              ${CategoryFilter({ mainCategory, subCategory })}
              <div class="flex gap-2 items-center justify-between">${LimitSelect()} ${SortSelect()}</div>
            </div>
          </div>

          <!-- 상품 목록 -->
          ${ProductList({ products })}
        </main>
        ${Footer()}
      </div>
    `;
  }

  onClickAddToCart(productId) {
    console.log(productId);
    alert("장바구니에 추가되었습니다");
  }

  mount(selector) {
    super.mount(selector);
    this.init();
  }
}
