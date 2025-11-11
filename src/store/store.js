export const store = {
  state: {
    pagination: { page: 1, limit: 20 },
    products: [],

    categories: {},
    selectedMain: null,
    selectedSub: null,

    loading: true,
  },
  listeners: [],

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn()); // ✅ 상태는 직접 접근
  },

  subscribe(fn) {
    this.listeners.push(fn);
    fn();
  },
};
