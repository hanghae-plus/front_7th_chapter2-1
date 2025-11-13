/**
 * @typedef ComponentContext
 * @property {string} selector - 컴포넌트 셀렉터
 * @property {object} state - 현재 상태
 * @property {function(object): void} setState - 상태 업데이트 함수
 * @property {object} props - 컴포넌트 props
 * @property {function} mountChildren - 자식 컴포넌트 마운트 함수
 * @property {function} onStateChange - 상태 변경 감지 함수
 */

/**
 * @typedef EventContext
 * @property {string} selector - 컴포넌트 셀렉터
 * @property {object} state - 현재 상태
 * @property {function(object): void} setState - 상태 업데이트 함수
 * @property {object} props - 컴포넌트 props
 * @property {function} mountChildren - 자식 컴포넌트 마운트 함수
 * @property {function} onStateChange - 상태 변경 감지 함수
 * @property {function} addEvent - 이벤트 등록 함수
 */

/**
 * @typedef Component 컴포넌트
 * @property {function(): object} initialState
 * @property {function(ComponentContext): string} template
 * @property {function(ComponentContext): void} children
 * @property {function(EventContext): void} setEvent
 * @property {function(ComponentContext): void} setup
 * @property {function(ComponentContext): void} onUpdated
 * @property {function(): void} onDestroy
 */

/**
 *
 * @param {Component} component
 * @returns {function(string, object): object}
 */

export const Component = (component) => {
  return (selector, props = {}) => {
    let state = component.initialState?.() || {};
    let children = [];
    let stateChangeListeners = [];
    let eventListeners = [];
    let setupCleanup = null;

    const setState = (updater) => {
      const prevState = { ...state };

      // 함수형 업데이트 지원
      const newState = typeof updater === "function" ? updater(prevState) : updater;

      state = { ...prevState, ...newState };

      // stateChange 리스너 실행
      stateChangeListeners.forEach(({ selector, callback }) => {
        const prevValue = selector(prevState);
        const currentValue = selector(state);

        // 배열인 경우 각 요소 비교
        if (Array.isArray(prevValue) && Array.isArray(currentValue)) {
          const hasChanged =
            prevValue.length !== currentValue.length || prevValue.some((val, idx) => val !== currentValue[idx]);

          if (hasChanged) {
            callback({ state, prevState, setState });
          }
        } else if (prevValue !== currentValue) {
          callback({ state, prevState, setState });
        }
      });

      render();
      component.setEvent?.(eventContext);
      component.onUpdated?.(context);
    };

    const onStateChange = (selector, callback) => {
      stateChangeListeners.push({ selector, callback });
    };

    const mountChildren = (ComponentFn, childSelector, childrenProps = {}) => {
      const childrenTarget = document.querySelector(childSelector);
      if (childrenTarget) {
        const child = ComponentFn(childSelector, childrenProps);
        child && children.push(child);
      }
    };

    const destroyChildren = () => {
      children.forEach((child) => {
        child?.destroy?.();
      });
      children = [];
    };

    const addEvent = (eventSelector, eventType, handler) => {
      const target = document.querySelector(selector);

      const wrappedHandler = (e) => {
        const targetElement = e.target.closest(eventSelector);
        if (targetElement) {
          handler(e, targetElement);
        }
      };

      target?.addEventListener(eventType, wrappedHandler);
      eventListeners.push({ eventType, handler: wrappedHandler });
    };

    const clearEventListeners = () => {
      const target = document.querySelector(selector);
      eventListeners.forEach(({ eventType, handler }) => {
        target?.removeEventListener(eventType, handler);
      });
      eventListeners = [];
    };

    const context = {
      selector,
      get state() {
        return state;
      },
      setState,
      props,
      mountChildren,
      onStateChange,
    };

    const eventContext = {
      ...context,
      addEvent,
    };

    const render = () => {
      clearEventListeners();
      destroyChildren();

      const target = document.querySelector(selector);
      target.innerHTML = component.template(context);

      component.children?.(context);
    };

    const mount = () => {
      render();
      component.setEvent?.(eventContext);
      setupCleanup = component.setup?.(context);
    };

    const destroy = () => {
      clearEventListeners();
      destroyChildren();

      // Call setup cleanup function if it exists
      if (typeof setupCleanup === "function") {
        setupCleanup();
      }

      component.onDestroy?.();
    };

    mount();

    return {
      state: () => state,
      setState,
      destroy,
    };
  };
};
