/**
 * @typedef Component 컴포넌트
 * @property {function(*): *} initialState
 * @property {function(({state, props})): string} template
 * @property {function(({state, props, mountChildren})): string} children
 * @property {function({state: object, setState: function}): void} onMounted
 * @property {function({state: object, setState: function}): void} onUpdated
 * @property {function({state: object, setState: function}): void} onDestroy
 */

/**
 *
 * @param {Component} component
 * @returns {function(object, object): object}
 */

export const Component = (component) => {
  return (selector, props = {}) => {
    let state = component.initialState?.() || {};
    let isMounted = false;
    let children = [];
    let stateChangeListeners = [];

    const setState = (newState) => {
      const prevState = { ...state };
      state = { ...prevState, ...newState };

      // stateChange 리스너 실행
      stateChangeListeners.forEach(({ paths, callback }) => {
        const hasChanged = paths.some((path) => {
          const keys = path.split(".");
          let prevValue = prevState;
          let currentValue = state;

          for (const key of keys) {
            prevValue = prevValue?.[key];
            currentValue = currentValue?.[key];
          }

          return prevValue !== currentValue;
        });

        if (hasChanged) {
          callback({ state, prevState, setState });
        }
      });

      render(prevState);
    };

    const onStateChange = (paths, callback) => {
      stateChangeListeners.push({
        paths: Array.isArray(paths) ? paths : [paths],
        callback,
      });
    };

    const mountChildren = (ComponentFn, selector, childrenProps = {}) => {
      const childrenTarget = document.querySelector(selector);
      if (childrenTarget) {
        const child = ComponentFn(selector, childrenProps);
        if (child) children.push(child);
      }
    };

    const destroyChildren = () => {
      children.forEach((child) => {
        if (child && child.destroy) child.destroy();
      });
      children = [];
    };

    const render = () => {
      destroyChildren();

      const target = document.querySelector(selector);
      target.innerHTML = component.template({ state, props });

      if (component.children) {
        component.children({ state, setState, props, mountChildren });
      }

      if (!isMounted) {
        isMounted = true;
        if (component.onMounted)
          component.onMounted({ selector, state, setState, props, mountChildren, onStateChange });
      }
    };

    const destroy = () => {
      isMounted = false;
      destroyChildren();

      if (component.onDestroy) component.onDestroy();
    };

    render();

    return {
      state: () => state,
      setState,
      destroy,
    };
  };
};
