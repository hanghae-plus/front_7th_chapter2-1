import { Component } from "../components/Component";
import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { getQueryStringAdding } from "../utils/queryString";
import { PageLayout } from "./PageLayout";

const BASE_URL = import.meta.env.BASE_URL;

export class HomePage2 extends Component {
  mount() {
    this.eventId = this.$container.addEventListener("click", (e) => {
      if (e.target.closest(".category1-filter-btn")) {
        const $category1Btn = e.target.closest(".category1-filter-btn");
        const category1 = $category1Btn.dataset.category1;
        const newQueryString = getQueryStringAdding("category1", category1);
        history.pushState(null, "", `${BASE_URL}${newQueryString}`);
        // router.navigateTo(`${BASE_URL}${newQueryString}`);
      } else if (e.target.closest(".category2-filter-btn")) {
        const $category2Btn = e.target.closest(".category2-filter-btn");
        const category2 = $category2Btn.dataset.category2;
        const newQueryString = getQueryStringAdding("category2", category2);
        history.pushState(null, "", `${BASE_URL}${newQueryString}`);
        // router.navigateTo(`${BASE_URL}${newQueryString}`);
      } else if (e.target.dataset.breadcrumb === "category1") {
        const category1 = e.target.dataset.category1;
        const $input = this.$container.querySelector("#search-input");
        const newQueryString = `?search=${$input.value}&category1=${category1}`;
        history.pushState(null, "", `${BASE_URL}${newQueryString}`);
        // router.navigateTo(`${BASE_URL}${queryString}`);
      } else if (e.target.dataset.breadcrumb === "reset") {
        const $input = this.$container.querySelector("#search-input");
        const newQueryString = `?search=${$input.value}`;
        history.pushState(null, "", `${BASE_URL}${newQueryString}`);
        // router.navigateTo(`${BASE_URL}${queryString}`);
      }
    });
  }

  unmount() {
    console.log({ eventId: this.eventId });
    this.$container.removeEventListener("click", this.$eventId);
  }

  template() {
    const {
      data: { filters, pagination, products },
      categories,
      isPending: loading,
    } = this.props;
    return PageLayout({
      children: `
        ${SearchForm({ filters, pagination, categories })}
        ${ProductList({ products, loading, total: pagination?.total ?? 0 })}
        `,
    });
  }
}
