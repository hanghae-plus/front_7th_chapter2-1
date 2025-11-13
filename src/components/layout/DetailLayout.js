import { Component } from "../../core/component/Component";
import { DetailHeader } from "./DetailHeader";
import { Footer } from "./Footer";

export class DetailLayout extends Component {
  mount() {
    super.mount();

    const header = this.$target.querySelector('[data-component="header"]');
    const children = this.$target.querySelector('[data-component="children"]');
    new DetailHeader(header);
    new this.props.children(children);
  }

  unmount() {
    super.unmount();
    this.header?.unmount();
    this.children?.unmount();
  }

  template() {
    return html`
      <div class="bg-gray-50">
        <header class="bg-white shadow-sm sticky top-0 z-40" data-component="header"></header>
        <div data-component="children"></div>
          ${Footer()}
        </div>
      </div>
    `;
  }
}
