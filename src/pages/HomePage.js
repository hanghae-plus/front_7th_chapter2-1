import Component from "@/core/Component";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import Header from "../components/Header";

class HomePage extends Component {
  template() {
    return `
    <header class="header-container"></header>
    <section class="product_list"></section>
    ${Footer()}
    `;
  }
  mounted() {
    const $header = document.querySelector(".header-container");
    new Header($header);
    const $productList = document.querySelector(".product_list");
    new ProductList($productList);
  }
}

export default HomePage;
