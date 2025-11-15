import { router } from "../router/index.js";

const states = new Map();
const effects = new Map();
const cleanups = new Map();
let currentComponent = null;
let hookIndex = 0;

/**
 * React의 useState와 유사한 API
 */
export function useState(initialValue) {
  const component = currentComponent;
  const index = hookIndex++;
  const key = `${component}-state-${index}`;

  if (!states.has(key)) {
    states.set(key, initialValue);
  }

  const state = states.get(key);

  const setState = (newValue) => {
    const value = typeof newValue === "function" ? newValue(states.get(key)) : newValue;

    if (states.get(key) !== value) {
      states.set(key, value);
      scheduleRender();
    }
  };

  return [state, setState];
}

/**
 * React의 useEffect와 유사한 API
 */
export function useEffect(effect, deps) {
  const component = currentComponent;
  const index = hookIndex++;
  const key = `${component}-effect-${index}`;

  const prevDeps = effects.get(key);
  const hasChanged = !prevDeps || !deps || deps.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    // 이전 cleanup 실행
    const cleanup = cleanups.get(key);
    if (cleanup) {
      cleanup();
    }

    // 새로운 effect 실행
    Promise.resolve().then(() => {
      const cleanupFn = effect();
      if (typeof cleanupFn === "function") {
        cleanups.set(key, cleanupFn);
      }
    });

    effects.set(key, deps);
  }
}

/**
 * 컴포넌트 시작 시 호출
 */
export function setCurrentComponent(name) {
  currentComponent = name;
  hookIndex = 0;
}

/**
 * 컴포넌트 언마운트 시 호출
 */
export function cleanupComponent(componentName) {
  // cleanup 함수 실행
  for (const [key, cleanup] of cleanups.entries()) {
    if (key.startsWith(componentName)) {
      cleanup();
      cleanups.delete(key);
    }
  }

  // 상태와 effect 정리
  for (const key of states.keys()) {
    if (key.startsWith(componentName)) {
      states.delete(key);
    }
  }

  for (const key of effects.keys()) {
    if (key.startsWith(componentName)) {
      effects.delete(key);
    }
  }
}

// 배치 렌더링
let renderScheduled = false;
function scheduleRender() {
  if (renderScheduled) return;

  renderScheduled = true;
  Promise.resolve().then(() => {
    renderScheduled = false;
    router.rerender();
  });
}
