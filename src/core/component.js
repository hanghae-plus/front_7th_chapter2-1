import { observe } from '@/core/observer';

/**
 * @class EventDelegator
 * @description
 * document에 이벤트를 한 번만 등록하고 이벤트 위임으로 처리하는 전역 이벤트 매니저
 * @private
 */
class EventDelegator {
  /** @type {Map<string, Set<EventBinding>>} */
  _eventHandlers = new Map();
  /** @type {Map<string, (event: Event) => void>} */
  _documentHandlers = new Map();

  /**
   * @method register
   * @param {string} eventType 이벤트 타입
   * @param {string} selector CSS 선택자
   * @param {Component} component 컴포넌트 인스턴스
   * @param {(event: Event) => void} callback 이벤트 핸들러
   * @returns {() => void} 이벤트 해제 함수
   */
  register(eventType, selector, component, callback) {
    if (!this._eventHandlers.has(eventType)) {
      this._eventHandlers.set(eventType, new Set());

      const handler = (event) => this._handleEvent(event);
      this._documentHandlers.set(eventType, handler);
      document.addEventListener(eventType, handler, true);
    }

    const binding = { selector, component, callback };
    this._eventHandlers.get(eventType).add(binding);

    return () => {
      const handlers = this._eventHandlers.get(eventType);

      if (!handlers) return;
      handlers.delete(binding);

      if (!handlers.size) return;
      const handler = this._documentHandlers.get(eventType);

      if (handler) {
        document.removeEventListener(eventType, handler, true);
        this._documentHandlers.delete(eventType);
      }
      this._eventHandlers.delete(eventType);
    };
  }

  /**
   * @method _handleEvent
   * @param {Event} event 발생한 이벤트
   * @private
   */
  _handleEvent(event) {
    const eventType = event.type;
    const handlers = this._eventHandlers.get(eventType);

    if (!handlers) return;

    const target = /** @type {Element} */ (event.target);

    for (const { selector, component, callback } of handlers) {
      const $target = component.$target;
      if (!$target) continue;

      if (!document.body.contains($target) && $target !== document.body) continue;

      if ($target.contains(target)) {
        const matchedElement = target.closest(selector);

        if (matchedElement && $target.contains(matchedElement)) callback(event);
      }
    }
  }
}

// 전역 이벤트 위임자 인스턴스
const eventDelegator = new EventDelegator();

/**
 * @class Component
 * @description
 * 컴포넌트 기반 UI 구조를 구현하기 위한 팩토리 클래스
 * 하위 클래스에서 `template`, `setup`, `setEvent`, `mounted` 메서드를 오버라이드하여 사용합니다.
 */
export default class Component {
  /** @type {Element} */ $target;
  /** @type {ComponentProps} */ props;
  /** @type {ComponentState} */ state;
  /** @type {Array<() => void>} */ _eventUnsubscribers = [];
  /** @type {Component[]} */ childComponents = [];

  /**
   * @constructor
   * @param {Element} $target 렌더링 대상 DOM 요소
   * @param {ComponentProps} [props={}] 초기 속성
   */
  constructor($target, props = {}) {
    this.$target = $target;
    this.props = props;
    this.setup();

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
   * @method unmounted
   * @description 컴포넌트가 제거되기 전에 실행되는 훅(hook)입니다.
   * 하위 클래스에서 정리 로직을 정의할 수 있습니다.
   * 기본적으로 childComponents를 자동으로 정리합니다.
   */
  unmounted() {
    if (this.childComponents && Array.isArray(this.childComponents)) {
      this.childComponents.forEach((component) => {
        if (component && typeof component.destroy === 'function') component.destroy();
      });
      this.childComponents = [];
    }
  }

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
   * @param {Partial<ComponentState>} newState 병합할 새로운 상태
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  /**
   * @method addEvent
   * @description
   * document에 이벤트를 위임하여 하위 요소에 이벤트를 바인딩합니다.
   * document에 각 이벤트 타입당 리스너를 한 번만 등록하고, 이벤트 위임으로 처리합니다.
   * @param {string} eventType 이벤트 타입 (예: 'click', 'input' 등)
   * @param {string} selector 이벤트를 감지할 하위 요소의 CSS 선택자
   * @param {(event: Event) => void} callback 이벤트 발생 시 실행할 콜백 함수
   */
  addEvent(eventType, selector, callback) {
    const unsubscribe = eventDelegator.register(eventType, selector, this, callback);
    this._eventUnsubscribers.push(unsubscribe);
  }

  /**
   * @method _cleanupEvents
   * @description
   * 컴포넌트가 제거될 때 등록된 모든 이벤트를 해제합니다.
   * @private
   */
  _cleanupEvents() {
    this._eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this._eventUnsubscribers = [];
  }

  /**
   * @method destroy
   * @description
   * 컴포넌트를 제거하고 모든 리소스를 정리합니다.
   * unmounted 훅을 호출하고 이벤트를 정리합니다.
   */
  destroy() {
    this.unmounted();
    this._cleanupEvents();
  }
}
