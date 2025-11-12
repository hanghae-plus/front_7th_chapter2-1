import { observe } from '@/core/observer';

/**
 * @class Component
 * @description
 * 컴포넌트 기반 UI 구조를 구현하기 위한 팩토리 클래스
 * 하위 클래스에서 `template`, `setup`, `setEvent`, `mounted` 메서드를 오버라이드하여 사용합니다.
 */
export default class Component {
  /** @type {Element} */ $target;
  /** @type {Record<string, any>} */ props;
  /** @type {Record<string, any>} */ state;
  /** @type {{ eventType: string, handler: (event: Event) => void }[]} */ _eventBindings = [];

  /**
   * @constructor
   * @param {Element} $target 렌더링 대상 DOM 요소
   * @param {Record<string, any>} [props={}] 초기 속성
   * @param {Record<string, any>} [props={}] 초기 속성
   */
  constructor($target, props = {}) {
    this.$target = $target;
    this.props = props;
    this.setup();

    // observe를 한 번만 등록하여 Store 구독
    // Store가 변경되면 자동으로 render()가 호출됨
    observe(() => {
      this.render();
    });

    this.setEvent();
  }

  /**
   * @method setup
   * @description state 초기화 등 렌더링 전에 수행할 작업을 정의합니다.
   * 하위 클래스에서 오버라이드할 수 있습니다.
   */
  setup() {}

  /**
   * @method mounted
   * @description DOM이 렌더링된 후 실행되는 훅(hook)입니다.
   * 하위 클래스에서 후처리 로직을 정의할 수 있습니다.
   */
  mounted() {}

  /**
   * @method template
   * @description 렌더링될 HTML 문자열을 반환합니다.
   * @returns {string} 렌더링할 HTML 템플릿
   */
  template() {
    return '';
  }

  /**
   * @method render
   * @description
   * `template()`을 호출하여 DOM을 갱신하고, 렌더링 후 `mounted()`를 실행합니다.
   * template() 내에서 Store에 접근하면 자동으로 구독이 등록됩니다.
   */
  render() {
    const templateResult = this.template();
    const templateString = typeof templateResult === 'string' ? templateResult.trim() : '';

    if (!templateString) {
      this.$target.innerHTML = '';
      this.mounted();
      return;
    }

    const template = document.createElement('template');
    template.innerHTML = templateString;
    const { children } = template.content;

    if (this.$target.hasAttribute('data-container')) {
      this.$target.innerHTML = '';
      Array.from(children).forEach((child) => {
        this.$target.appendChild(child);
      });
    } else if (children.length === 1) {
      const newRoot = children[0];
      this.$target.replaceWith(newRoot);
      this.$target = /** @type {Element} */ (newRoot);
      this._bindStoredEvents();
    } else {
      if (children.length > 1) {
        console.warn(
          `${this.constructor.name} 컴포넌트는 하나의 루트 엘리먼트를 반환해야 합니다. 여러 루트가 필요한 경우 래퍼 엘리먼트를 추가해주세요.`
        );
      }
      this.$target.innerHTML = templateString;
    }

    this.mounted();
  }

  /**
   * @method setEvent
   * @description
   * 이벤트 바인딩을 정의하는 메서드입니다.
   * `addEvent()`를 활용하여 이벤트 위임을 설정할 수 있습니다.
   */
  setEvent() {}

  /**
   * @method setState
   * @description
   * 상태를 갱신하고 자동으로 다시 렌더링합니다.
   * @param {Record<string, any>} newState 병합할 새로운 상태
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  /**
   * @method addEvent
   * @description
   * 이벤트 위임을 통해 하위 요소에 이벤트를 바인딩합니다.
   * @param {string} eventType 이벤트 타입 (예: 'click', 'input' 등)
   * @param {string} selector 이벤트를 감지할 하위 요소의 CSS 선택자
   * @param {(event: Event) => void} callback 이벤트 발생 시 실행할 콜백 함수
   */
  addEvent(eventType, selector, callback) {
    const handler = (event) => {
      const target = /** @type {Element} */ (event.target);
      if (target.closest(selector)) {
        callback(event);
      }
    };

    this._eventBindings.push({ eventType, handler });
    this.$target.addEventListener(eventType, handler);
  }

  /**
   * @method _bindStoredEvents
   * @description
   * `addEvent`로 등록된 이벤트 바인딩을 현재 루트 요소에 다시 연결합니다.
   * 루트 요소가 교체되는 렌더링 시 자동으로 호출됩니다.
   * @private
   */
  _bindStoredEvents() {
    if (!this.$target) return;
    this._eventBindings.forEach(({ eventType, handler }) => {
      this.$target.addEventListener(eventType, handler);
    });
  }
}
