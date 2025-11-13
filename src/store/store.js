const initState = {
  categories: new Map(),
  products: [],
  selectedProduct: {
    title: "",
    link: "",
    image: "",
    lprice: "",
    hprice: "",
    mallName: "",
    productId: "",
    productType: "",
    brand: "",
    maker: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    description: "",
    rating: 0,
    reviewCount: 0,
    stock: 0,
    images: [],
  },
  filters: {
    search: "",
    category1: "",
    category2: "",
    sort: "price_asc",
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  cart: {
    isOpen: false,
    selectedAll: false,
    quantity: 1,
    list: new Map(),
  },
  toast: {
    isOpen: false,
    type: "success",
  },
  isError: false,
};

export const createStore = () => {
  let state = { ...initState };
  const listeners = new Set();

  const getState = (key) => (key ? state[key] : state);
  const setState = (newState) => {
    state = { ...state, ...newState };
    console.log(state);

    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { getState, setState, subscribe };
};

// 스토어 싱글톤 패턴
export const store = createStore();

// export const useStore = () => {
//   const store = createStore();
//   return store;
// };

// export const persistStore = () => {
//   const persistState = () => {
//     localStorage.setItem("store", JSON.stringify(state));
//   };
//   const loadState = () => {
//     const storedState = localStorage.getItem("store");
//     return storedState ? JSON.parse(storedState) : initState;
//   };
//   return { persistState, loadState };
// };
