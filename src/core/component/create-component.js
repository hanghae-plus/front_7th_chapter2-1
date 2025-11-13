/*
- 컴포넌트가 각자의 container를 가져야함. 그 컨테이너는 query 식별자를 가져야함.
  - 이 container 식별자로 component 내부 state의 변화로 이를 의존하는 컴포넌트만 렌더링이 발생하도록 해야함.
*/

/**
 * @typedef {Record<string, any>} Props
 * @typedef {Record<string, any>} State
 * @typedef {(state: State) => void} RenderCallback
 * @typedef {(key: string, value: any | ((prev: any) => any)) => void} Setter
 * @typedef {(key: string) => any} Getter
 */

/**
 * @param {State} state
 * @returns {{ getState: (key: string) => any, setState: (key: string, value: any | ((prev: any) => any)) => void, subscribe: (observer: (args: any) => void) => () => void }}
 */
const createStateMap = (state) => {
  /** @type {Map<string, any>} */
  const stateMap = new Map(Object.entries(state));

  /** @type {Set<(args: any) => void>} */
  const observers = new Set();
  /** @type {boolean} */
  let pendingNotify = false;

  const getValueMap = () => {
    /** @type {Record<string, any>} */
    const valueMap = {};
    stateMap.forEach((value, key) => {
      valueMap[key] = value;
    });
    return valueMap;
  };

  const notifyObservers = () => {
    if (pendingNotify) return;
    pendingNotify = true;

    Promise.resolve().then(() => {
      pendingNotify = false;
      const currentState = getValueMap();
      observers.forEach((observer) => observer(currentState));
    });
  };

  return {
    getState: (/** @type {string} */ key) => {
      return stateMap.get(key);
    },
    setState: (/** @type {string} */ key, /** @type {any | ((prev: any) => any)} */ value) => {
      if (value instanceof Function) {
        value = value(stateMap.get(key));
      }
      stateMap.set(key, value);
      notifyObservers();
    },
    subscribe: (observer) => {
      observers.add(observer);
      return () => observers.delete(observer);
    },
  };
};

/**
 * @typedef {Object} CreateComponentOptions
 * @property {string} id
 * @property {Props} [props={}]
 * @property {(props: Props) => State} [initialState=() => ({})]
 * @property {(props: Props, state: State, setState: Setter, children?: string) => string} templateFn
 * @property {Record<string, (props: Props, getter: Getter, setter: Setter, event: Event) => void>} [eventHandlers={}]
 * @property {HTMLElement[]} [children=[]]
 * @returns {{ mount: (props: Props) => HTMLElement }}
 */

/**
 * @param {CreateComponentOptions} options
 * @returns {{ mount: (props: Props) => HTMLElement }}
 */
export default function createComponent({
  id,
  props = {}, // initial props
  initialState = () => ({}),
  templateFn,
  eventHandlers = {},
  children = [],
}) {
  /** @type {Props} */
  let currentProps = props;
  const componentId = `${id}-${Math.random().toString(36).substring(2, 15)}`;
  let isRendering = false;

  /** @type {(() => void) | null} */
  let unsubscribe = null;

  /**
   * @param {string} html
   */
  const parseAndGetWrapperElement = (html) => {
    const range = document.createRange();
    const parsedFragment = range.createContextualFragment(html);

    /** @type {HTMLElement | null} */
    const wrapperElement = parsedFragment.firstElementChild;
    if (!wrapperElement) return null;
    wrapperElement.dataset.component = componentId;
    return wrapperElement;
  };

  /** @type {RenderCallback} */
  const render = (_state) => {
    isRendering = true;
    const targetElement = document.querySelector(`[data-component="${componentId}"]`);
    if (!targetElement) {
      isRendering = false;
      return;
    }
    const childrenHTML = children.map((child) => child.outerHTML).join("");
    const wrapperElement = parseAndGetWrapperElement(templateFn(currentProps, _state, setState, childrenHTML));
    targetElement.replaceWith(wrapperElement);

    setTimeout(() => {
      isRendering = false;
    }, 0);
  };

  const { getState, setState, subscribe } = createStateMap(initialState(currentProps));

  unsubscribe = subscribe(render);

  if (!window.__componentEventHandlers) {
    window.__componentEventHandlers = new Map();
  }

  if (!window.__componentEventListenersRegistered) {
    window.__componentEventListenersRegistered = true;

    const EVENT_TYPES = ["click", "change", "input", "submit", "keydown", "focus", "blur"];

    EVENT_TYPES.forEach((eventType) => {
      document.addEventListener(
        eventType,
        (/** @type {Event} */ event) => {
          if (!event.target) return;
          const eventTarget = event.target.closest("[data-event]");
          if (!eventTarget) return;

          const componentElement = eventTarget.closest("[data-component]");
          if (!componentElement) return;

          const componentId = componentElement.dataset.component;
          const eventName = eventTarget.dataset.event;

          if (!componentId || !eventName) return;

          const eventTypeAttr = eventTarget.dataset.eventType;
          if (eventTypeAttr !== event.type) return;

          const handlers = window.__componentEventHandlers.get(componentId);
          if (handlers?.[eventName]) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            handlers[eventName](event);
          }
        },
        eventType === "focus" || eventType === "blur",
      );
    });
  }

  window.__componentEventHandlers.set(
    componentId,
    Object.fromEntries(
      Object.entries(eventHandlers).map(([eventName, handler]) => [
        eventName,
        (/** @type {Event} */ event) => {
          if (isRendering) return;
          handler(currentProps, getState, setState, event);
        },
      ]),
    ),
  );

  return {
    mount: (_props = {}) => {
      currentProps = _props;
      const childrenHTML = children.map((child) => child.outerHTML).join("");
      const html = templateFn(_props, initialState(_props), setState, childrenHTML);
      const element = parseAndGetWrapperElement(html);

      const observer = new MutationObserver(() => {
        if (!document.contains(element)) {
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
            window.__componentEventHandlers.delete(componentId);
          }
          observer.disconnect();
        }
      });

      setTimeout(() => {
        if (element.parentNode) {
          observer.observe(element.parentNode, { childList: true });
        }
      }, 0);

      return element;
    },
  };
}

// // example
// const CartCountComponent = createComponent(
//   "cart-count-component",
//   { count: 0 },
//   ({ count }) => {
//     return /* HTML */ `
//       <div>
//         <button data-event="add">+</button>
//         <h1>${count}</h1>
//         <button data-event="subtract">-</button>
//       </div>
//     `;
//   },
//   {
//     add: (getter, setter) => {
//       setter("count", (/** @type {number} */ prev) => prev + 1);
//     },
//     subtract: (getter, setter) => {
//       setter("count", (/** @type {number} */ prev) => prev - 1);
//     },
//   },
// );
