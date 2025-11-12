import { Component } from "../../core/component/Component";

export class ProductDetailPage extends Component {
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
