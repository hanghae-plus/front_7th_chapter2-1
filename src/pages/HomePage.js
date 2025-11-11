import Component from "@/core/Component";
import Layout from "@/components/Layout";
import ProductList from "@/components/ProductList";

class HomePage extends Component {
  template() {
    return `
    ${Layout(`<section class="product_list"></section>`)}
    `;
  }
  mounted() {
    const $productList = document.querySelector(".product_list");
    new ProductList($productList);
  }
}

export default HomePage;
