import { Component } from "../components/Component";
import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { getQueryStringAdding, getQueryStringExcluding, getQueryStringValue } from "../utils/queryString";
import { PageLayout } from "./PageLayout";

const BASE_URL = import.meta.env.BASE_URL;

export class HomePage2 extends Component {
  mount() {
    this.clickEventId = this.$container.addEventListener("click", (e) => {
      // 카드 선택
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        const productId = productCard.dataset.productId;
        window.router2Instance.navigateTo(`${BASE_URL}product/${productId}`);
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
        window.router2Instance.navigateTo(`${BASE_URL}${newQueryString}`);
      } else if (e.target.closest(".category2-filter-btn")) {
        const $category2Btn = e.target.closest(".category2-filter-btn");
        const category2 = $category2Btn.dataset.category2;
        const currentCategory2 = getQueryStringValue("category2");
        if (category2 === currentCategory2) return;
        const newQueryString = getQueryStringAdding("category2", category2);
        window.router2Instance.navigateTo(`${BASE_URL}${newQueryString}`);
      }
      // 브레드 크럼브 클릭
      if (e.target.dataset.breadcrumb === "category1") {
        const category1 = e.target.dataset.category1;
        const currentCategory2 = getQueryStringValue("category2");
        const $input = this.$container.querySelector("#search-input");
        const newQueryString = `?search=${$input.value}&category1=${category1}`;
        if (!currentCategory2) return;
        window.router2Instance.navigateTo(`${BASE_URL}${newQueryString}`);
      } else if (e.target.dataset.breadcrumb === "reset") {
        const $input = this.$container.querySelector("#search-input");
        const currentCategory1 = getQueryStringValue("category1");
        const currentCategory2 = getQueryStringValue("category2");
        if (!currentCategory1 && !currentCategory2) return;
        const newQueryString = $input.value ? `?current=1&search=${$input.value}` : "?current=1&";
        window.router2Instance.navigateTo(`${BASE_URL}${newQueryString}`);
      }
    });

    this.keydownEventId = this.$container.addEventListener("keydown", (e) => {
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
          window.router2Instance.navigateTo(`${BASE_URL}${newQueryString}`);
        }
      }
    });
  }

  unmount() {
    this.$container.removeEventListener("click", this.clickEventId);
    this.$container.removeEventListener("keydown", this.keydownEventId);
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
