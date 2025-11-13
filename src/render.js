import { flushEffects } from "./hooks/useEffect.js";

/**
 * @param {string} component
 */
export function render(component) {
  if (!component) {
    throw new Error("Component is required");
  }
  const $root = document.querySelector("#root");
  $root.innerHTML = component();

  // 렌더링 후 이펙트
  flushEffects();
}
