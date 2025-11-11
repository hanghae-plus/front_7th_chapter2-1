const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      search: "",
      limit: "20",
      sort: "price_asc",
      path: "/",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    search: params.get("search") ?? "",
    limit: params.get("limit") ?? "20",
    sort: params.get("sort") ?? "price_asc",
    path: window.location.pathname,
  };
};

export const store = {
  state: {
    ...getInitialState(),
    products: [],
    isLoaded: false,
    categories: {},
    currentProduct: {},
    relatedProducts: [],
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
