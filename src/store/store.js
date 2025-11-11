const params = new URLSearchParams(location.search);
const category1 = params.get("category1");
const category2 = params.get("category2");

export const store = {
  state: {
    pagination: { page: 1, limit: 20 },
    products: [],

    categories: {},
    selectedMain: category1 || "",
    selectedSub: category2 || "",

    loading: category1 ? false : true,
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
