import Component from "@/core/Component";
import Layout from "@/components/Layout";
import ProductList from "@/components/ProductList";

class HomePage extends Component {
  template() {
    return `<div id="layout-container"></div>`;
  }
  mounted() {
    const $layoutContainer = this.$target.querySelector("#layout-container");
    new Layout($layoutContainer, {
      children: `<section class="product_list"></section>`,
    });

    const $productList = document.querySelector(".product_list");
    new ProductList($productList);
  }
}

export default HomePage;
