import { Component } from "../../../core/component/Component";
import { html } from "../../../utils/html";

export class AddCartButton extends Component {
  setEvents() {
    this.addEventListener("click", "#add-to-cart-btn", () => {
      this.props.onAddToCart();
    });
  }

  template() {
    const { productId } = this.props;
    return html`
      <button
        id="add-to-cart-btn"
        data-product-id="${productId}"
        class="w-full bg-blue-600 text-white py-3 px-4 rounded-md
                 hover:bg-blue-700 transition-colors font-medium"
      >
        장바구니 담기
      </button>
    `;
  }
}
