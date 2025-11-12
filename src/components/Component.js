export class Component {
  constructor($container, props = {}) {
    this.$container = $container;
    this.props = props;
    this.state = {};
    this.mount();
    this.render();
  }

  mount() {}

  unmount() {
    this.$container.innerHTML = "";
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  template() {
    return "";
  }

  render() {
    this.$container.innerHTML = this.template();
  }

  async updateProps(newProps) {
    this.props = { ...this.props, ...newProps };
    this.render();
    return Promise.resolve();
  }
}
