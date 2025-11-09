export class BaseComponent {
  constructor(props = {}) {
    this.props = props;
    this.state = props.state ?? {};
    this.el = null;
  }

  setState(state) {
    // 같은 경우에는 렌더 x
    if (JSON.stringify(this.state) === JSON.stringify(state)) {
      return;
    }

    if (typeof state === "function") {
      this.state = state(this.state);
    } else {
      this.state = state;
    }

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
