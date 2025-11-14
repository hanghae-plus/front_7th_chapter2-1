export function createStore(initialState) {
  let state = initialState;
  const observers = new Set();

  const getState = () => state;

  const setState = (rest) => {
    state = { ...state, ...rest };
    observers.forEach((observer) => observer(state));
  };

  const subscribe = (render) => {
    observers.add(render);
    return () => observers.delete(render);
  };

  return { getState, setState, subscribe };
}
