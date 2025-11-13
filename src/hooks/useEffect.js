let effectQueue = [];
let isExecuting = false;
let prevDependencies = new WeakMap(); // callback 함수를 키로 사용
let cleanupFunctions = new WeakMap(); // cleanup 함수 저장

export const useEffect = (callback, dependencies) => {
  effectQueue.push({ callback, dependencies });
};

export const flushEffects = () => {
  if (isExecuting) return;

  isExecuting = true;
  Promise.resolve().then(() => {
    const effects = [...effectQueue];
    effectQueue = [];

    effects.forEach(({ callback, dependencies }) => {
      const prevDeps = prevDependencies.get(callback);

      // 의존성 비교: 이전 값이 없거나, 하나라도 변경되었으면 실행
      const shouldRun =
        !prevDeps ||
        !dependencies || // 의존성 배열이 없으면 항상 실행
        dependencies.length !== prevDeps.length ||
        dependencies.some((dep, index) => dep !== prevDeps[index]);

      if (shouldRun) {
        // 이전 cleanup 함수 실행
        const cleanup = cleanupFunctions.get(callback);
        if (cleanup) {
          cleanup();
        }

        // effect 실행 및 cleanup 저장
        const newCleanup = callback();
        if (typeof newCleanup === "function") {
          cleanupFunctions.set(callback, newCleanup);
        }

        prevDependencies.set(callback, dependencies);
      }
    });
    isExecuting = false;
  });
};
