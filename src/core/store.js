export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = [];

  const getState = () => state;

  const setState = (updates) => {
    state = { ...state, ...updates };
    // 모든 구독자(listener)에게 상태 변경 알림
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    // unsubscribe 함수 반환
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  };

  return { getState, setState, subscribe };
}
