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
 * @param {RenderCallback} renderCallback
 * @returns {{ getState: (key: string) => any, setState: (key: string, value: any | ((prev: any) => any)) => void }}
 */
const createStateMap = (state, renderCallback) => {
  /** @type {Map<string, any>} */
  const stateMap = new Map(Object.entries(state));

  const getValueMap = () => {
    /** @type {Record<string, any>} */
    const valueMap = {};
    stateMap.forEach((value, key) => {
      valueMap[key] = value;
    });
    return valueMap;
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
      if (renderCallback) {
        renderCallback(getValueMap());
      }
    },
  };
};

/**
 * @typedef {Object} CreateComponentOptions
 * @property {string} id
 * @property {Props} [props={}]
 * @property {State} [initialState={}]
 * @property {(props: Props, state: State, children?: string) => string} templateFn
 * @property {Record<string, (getter: Getter, setter: Setter) => void>} [eventHandlers={}]
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
  initialState = {},
  templateFn,
  eventHandlers = {},
  children = [],
}) {
  /** @type {Props} */
  let currentProps = props;
  const componentId = `${id}-${Math.random().toString(36).substring(2, 15)}`;

  /**
   * @param {string} html
   */
  const parseAndGetWrapperElement = (html) => {
    const range = document.createRange();
    const parsedFragment = range.createContextualFragment(html);

    /** @type {HTMLElement} */
    const wrapperElement = parsedFragment.firstElementChild;
    wrapperElement.dataset.component = componentId;
    return wrapperElement;
  };

  /** @type {RenderCallback} */
  const render = (_state) => {
    const targetElement = document.querySelector(`[data-component="${componentId}"]`);
    console.log("[Render] targetElement", { targetElement });
    if (!targetElement) return;
    const childrenHTML = children.map((child) => child.outerHTML).join("");
    const wrapperElement = parseAndGetWrapperElement(templateFn(currentProps, _state, childrenHTML));
    console.log({ targetElement, wrapperElement }, wrapperElement instanceof HTMLElement);
    targetElement.replaceWith(wrapperElement);
  };

  const { getState, setState } = createStateMap(initialState, render);

  console.log("[Create Component] window.__componentEventHandlers", componentId);

  if (!window.__componentEventHandlers) {
    window.__componentEventHandlers = new Map();

    const EVENT_TYPES = ["click", "change", "input", "submit", "keydown", "focus", "blur"];

    EVENT_TYPES.forEach((eventType) => {
      document.addEventListener(
        eventType,
        (/** @type {Event} */ event) => {
          if (!event.target) return;
          const eventTarget = event.target.closest("[data-event]");
          if (!eventTarget) return;

          const componentId = eventTarget.closest("[data-component]")?.dataset.component;
          const eventName = eventTarget.dataset.event;

          if (!componentId || !eventName) return;

          const handlers = window.__componentEventHandlers.get(componentId);
          if (handlers?.[eventName]) {
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
        (/** @type {Event} */ event) => handler(getState, setState, event),
      ]),
    ),
  );

  return {
    mount: (_props = {}) => {
      currentProps = _props;
      const childrenHTML = children.map((child) => child.outerHTML).join("");
      const html = templateFn(_props, initialState, childrenHTML);
      return parseAndGetWrapperElement(html);
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
