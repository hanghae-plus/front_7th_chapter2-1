import Component from "@/core/Component";
import Layout from "@/components/Layout";

class CartPage extends Component {
  template() {
    return `<div id="layout-container"></div>`;
  }
  mount() {
    const $layoutContainer = this.$target.querySelector("#layout-container");
    if ($layoutContainer) {
      new Layout($layoutContainer, { children: "" });
    }
  }
}

export default CartPage;
