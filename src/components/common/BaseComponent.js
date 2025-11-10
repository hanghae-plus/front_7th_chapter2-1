export class BaseComponent {
  constructor(props = {}) {
    this.props = props;
    this.state = props.state ?? {};
    this.el = null;
  }

  setState(state) {
    this.state = { ...this.state, ...state };
    this.render();
  }

  mount(selector) {
    this.el = document.querySelector(selector);
    this.events();
    this.render();
  }

  render() {
    this.el.innerHTML = this.template();
  }

  template() {
    return "";
  }
  events() {}
}
