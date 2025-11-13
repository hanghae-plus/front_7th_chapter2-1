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
  const savedCart = localStorage.getItem("shopping_cart");

  return {
    search: params.get("search") ?? "",
    limit: params.get("limit") ?? "20",
    sort: params.get("sort") ?? "price_asc",
    category1: params.get("category1") ?? "",
    category2: params.get("category2") ?? "",
    path: window.location.pathname,
    cartList: savedCart ? JSON.parse(savedCart) : [],
  };
};

export const store = {
  state: {
    ...getInitialState(),
    products: [],
    isLoaded: false,
    error: null,
    categories: {},
    currentProduct: {},
    relatedProducts: [],
    toastState: "",
    isCartModalOpen: false,
    currentPage: 1,
    hasMore: true,
    isLoadingMore: false,
  },
  listeners: new Set(),

  setState(newState) {
    this.state = { ...this.state, ...newState };

    // shopping_cart localStorage 저장
    if (newState.cartList) {
      localStorage.setItem("shopping_cart", JSON.stringify(this.state.cartList));
    }

    this.listeners.forEach((fn) => fn(this.state));
  },

  subscribe(fn) {
    this.listeners.add(fn);
    fn(this.state); // 초기 호출
    return () => this.listeners.delete(fn);
  },
};
