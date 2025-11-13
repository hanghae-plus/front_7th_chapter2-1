import { shallowEqual } from "../../utils/shallow-equal";

export class Component {
  constructor($target, props = {}) {
    this.props = props;
    this.$target = $target;
    this._effects = [];
    this._isMounted = false;
    this._eventListeners = [];
    this.setup();
    this.render();
    this.setEvents();
    this.mount();
  }

  setup() {}

  mount() {
    this._runEffects();
    this._isMounted = true;
  }

  setState(update) {
    const prevState = { ...this.state };
    const nextState = typeof update === "function" ? update(prevState) : update;
    this.state = { ...prevState, ...nextState };

    this.render();
    this._runEffects(prevState);
  }

  addEventListener(eventType, selector, callback) {
    if (!this.$target) throw new Error("DOM 요소를 찾을 수 없습니다.");

    const listener = (e) => {
      if (e.target.closest(selector)) {
        callback(e);
      }
    };

    this.$target.addEventListener(eventType, listener);

    // 나중에 unmount 할 때 제거하기 위해 저장
    this._eventListeners.push({ eventType, listener });
  }

  useEffect(callback, deps = []) {
    this._effects.push({ callback, deps, cleanup: null, prevDeps: undefined });
  }

  _runEffects(prevState = {}) {
    this._effects.forEach((effect) => {
      const { deps, prevDeps, callback, cleanup } = effect;

      // !prevDeps = 최초 렌더링
      // deps로 콜백을 넣은 경우 callback(state,props) 실행
      // 쉽게 deps 중 하나라도 변경됐는지 확인
      const hasChanged =
        !prevDeps ||
        deps.some((dep, i) => {
          const currentValue = typeof dep === "function" ? dep(this.state, this.props) : dep;
          const prevValue = typeof prevDeps?.[i] === "function" ? prevDeps[i](prevState, this.props) : prevDeps?.[i];

          if (isObject(currentValue) && isObject(prevValue)) {
            return !shallowEqual(currentValue, prevValue);
          }

          return currentValue !== prevValue;
        });

      // 변경됐다면 cleanup 실행 후 콜백 실행
      if (hasChanged) {
        if (typeof cleanup === "function") cleanup();
        const maybeCleanup = callback();

        // return 값이 있다면 cleanup 함수로 저장
        effect.cleanup = typeof maybeCleanup === "function" ? maybeCleanup : null;
        effect.prevDeps = [...deps];
      }
    });
  }

  unmount() {
    // cleanup 모두 실행 (null 제외)
    this._effects.forEach((e) => e.cleanup && e.cleanup());

    // 등록된 이벤트 리스너 제거
    this._eventListeners.forEach(({ eventType, listener }) => {
      this.$target.removeEventListener(eventType, listener);
    });

    this._eventListeners = [];

    if (this.$target) {
      this.$target.innerHTML = "";
      this.$target = null;
    }

    this._isMounted = false;
  }

  render() {
    if (!this.$target) return;
    this.$target.innerHTML = this.template();
  }

  template() {
    return "";
  }
  setEvents() {}
}

function isObject(value) {
  return typeof value === "object" && value !== null;
}
