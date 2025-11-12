class Component {
  $target;
  $props;
  state = {};
  $mounted = false; // mounted 실행 여부 추적
  $eventListeners = []; // 등록된 이벤트 리스너 추적
  $childComponents = []; // 자식 컴포넌트 추적

  constructor($target, $props) {
    this.$target = $target;
    this.$props = $props;
    this.didMount();
    this.setup();
    this.setEvent();
    this.render();
    // 첫 렌더 후 mounted 한 번만 실행
    if (!this.$mounted) {
      this.$mounted = true;
      this.mounted();
    }
  }
  initState() {
    return {};
  }

  setup() {
    this.state = this.initState();
  }
  didMount() {} // 컴포넌트가 rende 되기전 실행

  mounted() {} // 컴포넌트가 마운트 되었을 때 (한 번만 실행)

  updated() {} // 컴포넌트가 업데이트 되었을 때 (render 후 매번 실행)

  template() {
    return "";
  }

  render() {
    this.$target.innerHTML = this.template(); // UI 렌더링
    this.updated(); // render 후 updated 호출 (자식 컴포넌트 재마운트를 위해)
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

  // 자식 컴포넌트 등록 (자동 재마운트를 위해)
  addChildComponent(component) {
    if (component) {
      this.$childComponents.push(component);
    }
  }

  unmount() {
    // 자식 컴포넌트들도 모두 unmount
    this.$childComponents.forEach((component) => {
      if (component && typeof component.unmount === "function") {
        component.unmount();
      }
    });
    this.$childComponents = [];
    // 등록된 모든 이벤트 리스너 해제
    this.$eventListeners.forEach(({ eventType, handler }) => {
      this.$target.removeEventListener(eventType, handler);
    });
    this.$eventListeners = [];
    // DOM 정리
    this.$target.innerHTML = "";
    // 마운트 플래그 리셋
    this.$mounted = false;
  }
}

export default Component;
