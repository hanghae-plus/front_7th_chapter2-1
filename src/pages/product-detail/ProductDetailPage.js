import { BaseComponent } from "../../core/component/BaseComponent.js";

export class ProductDetailPage extends BaseComponent {
  constructor(props = {}) {
    super(props);
  }

  template() {
    return html`
      <div>
        <h1>Product Detail</h1>
      </div>
    `;
  }

  mounted() {
    console.log("ProductDetailPage mounted");
  }
}
