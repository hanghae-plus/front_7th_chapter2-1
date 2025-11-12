import { Component } from "../../core/component/Component";

export class NotFoundPage extends Component {
  constructor(props = {}) {
    super(props);
  }

  template() {
    return html`
      <div>
        <h1>NotFoundPage</h1>
      </div>
    `;
  }
}
