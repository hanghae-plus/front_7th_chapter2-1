export const store = {
  state: {
    products: [],
    isLoaded: false,
  },
  listeners: new Set(),

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((fn) => fn(this.state));
  },

  subscribe(fn) {
    this.listeners.add(fn);
    fn(this.state); // 초기 호출
    return () => this.listeners.delete(fn);
  },
};
