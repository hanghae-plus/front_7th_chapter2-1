import { Component } from "../components/Component";
import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { CartUtil } from "../utils/cart";
import { getQueryStringAdding, getQueryStringExcluding, getQueryStringValue } from "../utils/queryString";
import { PageLayout } from "./PageLayout";

export class HomePage2 extends Component {
  handleClick(e) {
    console.log("this.$container", this.$container);
    // 카드
    if (e.target.closest(".add-to-cart-btn")) {
      const { loaderData } = this.props;
      const productId = e.target.closest(".product-card").dataset.productId;
      const product = loaderData.products.find((product) => product.productId === productId);
      CartUtil.addCard(product);
    } else if (e.target.closest(".product-card")) {
      const productCard = e.target.closest(".product-card");
      const productId = productCard.dataset.productId;
      window.router2Instance.navigateTo(`${window.BASE_URL}product/${productId}`);
    } else if (e.target.tagName === "A") {
      e.preventDefault();
      window.router2Instance.navigateTo(e.target.pathname);
    }
    // 카테고리 필터 버튼
    if (e.target.closest(".category1-filter-btn")) {
      const $category1Btn = e.target.closest(".category1-filter-btn");
      const category1 = $category1Btn.dataset.category1;
      const currentCategory1 = getQueryStringValue("category1");
      if (category1 === currentCategory1) return;
      const newQueryString = getQueryStringAdding("category1", category1);
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    } else if (e.target.closest(".category2-filter-btn")) {
      const $category2Btn = e.target.closest(".category2-filter-btn");
      const category2 = $category2Btn.dataset.category2;
      const currentCategory2 = getQueryStringValue("category2");
      if (category2 === currentCategory2) return;
      const newQueryString = getQueryStringAdding("category2", category2);
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    }
    // 브레드 크럼브 클릭
    if (e.target.dataset.breadcrumb === "category1") {
      const category1 = e.target.dataset.category1;
      const currentCategory2 = getQueryStringValue("category2");
      const $input = this.$container.querySelector("#search-input");
      const newQueryString = `?search=${$input.value}&category1=${category1}`;
      if (!currentCategory2) return;
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    } else if (e.target.dataset.breadcrumb === "reset") {
      const $input = this.$container.querySelector("#search-input");
      const currentCategory1 = getQueryStringValue("category1");
      const currentCategory2 = getQueryStringValue("category2");
      if (!currentCategory1 && !currentCategory2) return;
      const newQueryString = $input.value ? `?current=1&search=${$input.value}` : "?current=1&";
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    }
  }

  handleKeydown(e) {
    if (e.key === "Enter") {
      const $input = e.target.closest("#search-input");

      const params = new URLSearchParams(window.location.search);
      const category1 = params.get("category1") ?? "";
      const category2 = params.get("category2") ?? "";
      let queryString = `?search=${$input.value}${category1 ? `&category1=${category1}` : ""}${category2 ? `&category2=${category2}` : ""}`;
      if ($input.value) {
        window.router2Instance.navigateTo(queryString);
      } else {
        const newQueryString = getQueryStringExcluding("search");
        window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
      }
    }
  }

  handleChange(e) {
    if (e.target.closest("#sort-select")) {
      const newQueryString = getQueryStringAdding("sort", e.target.value);
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    } else if (e.target.closest("#limit-select")) {
      const newQueryString = getQueryStringAdding("limit", e.target.value);
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    }
  }

  mount() {
    this.$container.addEventListener("click", this.handleClick.bind(this));
    this.$container.addEventListener("keydown", this.handleKeydown.bind(this));
    this.$container.addEventListener("change", this.handleChange.bind(this));
  }

  unmount() {
    this.$container.removeEventListener("click", this.handleClick.bind(this));
    this.$container.removeEventListener("keydown", this.handleKeydown.bind(this));
    this.$container.removeEventListener("change", this.handleChange.bind(this));
  }

  template() {
    const { loaderData, isPending: loading, queryString } = this.props;
    return PageLayout({
      children: `
        ${SearchForm({ ...loaderData, filters: queryString /*, filters, pagination, categories */ })}
        ${ProductList({ products: loaderData?.products ?? [], loading, total: loaderData?.pagination?.total ?? 0 })}
        `,
    });
  }
}
