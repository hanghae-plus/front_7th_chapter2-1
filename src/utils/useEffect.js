const effects = new Map();
const cleanups = new Map();
let currentComponent = null;
let effectIndex = 0;

/**
 * React의 useEffect와 유사한 API
 * @param {Function} effect - 실행할 side effect 함수
 * @param {Array} deps - 의존성 배열
 */
export function useEffect(effect, deps) {
  const component = currentComponent;
  const index = effectIndex++;
  const key = `${component}-${index}`;

  // 이전 의존성 가져오기
  const prevDeps = effects.get(key);

  // 의존성 비교
  const hasChanged = !prevDeps || !deps || deps.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    // 이전 cleanup 함수 실행
    const cleanup = cleanups.get(key);
    if (cleanup) {
      cleanup();
    }

    // 새로운 effect 실행 (비동기로)
    Promise.resolve().then(() => {
      const cleanupFn = effect();
      if (typeof cleanupFn === "function") {
        cleanups.set(key, cleanupFn);
      }
    });

    // 의존성 저장
    effects.set(key, deps);
  }
}

export function setCurrentComponent(name) {
  currentComponent = name;
  effectIndex = 0;
}

// 컴포넌트 언마운트 시 cleanup 실행
export function cleanupComponent(componentName) {
  for (const [key, cleanup] of cleanups.entries()) {
    if (key.startsWith(componentName)) {
      cleanup();
      cleanups.delete(key);
    }
  }

  for (const key of effects.keys()) {
    if (key.startsWith(componentName)) {
      effects.delete(key);
    }
  }
}
