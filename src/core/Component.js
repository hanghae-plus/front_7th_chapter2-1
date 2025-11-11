import { observable, observe } from "./observer";

class Component {
  $target;
  $props;
  state = {};
  $eventListeners = []; // 등록된 이벤트 리스너 추적

  constructor($target, $props) {
    this.$target = $target;
    this.$props = $props;
    this.setup();
    this.setEvent();
    this.render();
  }
  initState() {
    return {};
  }

  setup() {
    this.state = observable(this.initState());
    observe(() => {
      this.render();
      this.setEvent();
      this.mounted();
    });
  }

  mounted() {} // 컴포넌트가 마운트 되었을 때

  template() {
    return "";
  }

  render() {
    this.$target.innerHTML = this.template(); // UI 렌더링
    this.mounted();
  }

  setEvent() {}

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  addEvent(eventType, selector, callback) {
    // 이벤트 등록 추상화
    const handler = (event) => {
      if (!event.target.closest(selector)) return false;
      return callback(event);
    };
    this.$target.addEventListener(eventType, handler);
    // 이벤트 리스너 추적 (unmount 시 해제를 위해)
    this.$eventListeners.push({ eventType, handler });
  }

  unmount() {
    // 등록된 모든 이벤트 리스너 해제
    this.$eventListeners.forEach(({ eventType, handler }) => {
      this.$target.removeEventListener(eventType, handler);
    });
    this.$eventListeners = [];
    // DOM 정리
    this.$target.innerHTML = "";
  }
}

export default Component;
