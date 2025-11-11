import { router } from "../router/index.js";

const states = new Map();
let currentComponent = null;
let stateIndex = 0;

/**
 * React의 useState와 유사한 API
 */
export function useState(initialValue) {
  const component = currentComponent;
  const index = stateIndex++;
  const key = `${component}-${index}`;

  if (!states.has(key)) {
    states.set(key, initialValue);
  }

  const state = states.get(key);

  const setState = (newValue) => {
    const value = typeof newValue === "function" ? newValue(states.get(key)) : newValue;

    if (states.get(key) !== value) {
      states.set(key, value);
      router.rerender();
    }
  };

  return [state, setState];
}

export function setCurrentComponent(name) {
  currentComponent = name;
  stateIndex = 0;
}
