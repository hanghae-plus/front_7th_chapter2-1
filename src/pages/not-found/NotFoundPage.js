import { BaseComponent } from "../../core/component/BaseComponent";

export class NotFoundPage extends BaseComponent {
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
