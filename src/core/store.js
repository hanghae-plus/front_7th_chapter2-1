export function createStore(initialState) {
  let state = initialState;
  let listeners = new Set();

  return {
    getState: () => state,

    setState: (updater) => {
      // 인자가 함수면 인자로 넣고, 아니면 덮어쓰기
      const newState = typeof updater === "function" ? updater(state) : { ...state, ...updater };

      // 모든 구독자에게 알림
      if (newState !== state) {
        state = newState;
        listeners.forEach((callback) => callback(state));
      }
    },

    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };
}
