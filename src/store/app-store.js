/**
 * @typedef {import('../types.js').ProductListResponse} ProductListResponse
 * @typedef {import('../types.js').CategoryTreeNode} CategoryTreeNode
 * @typedef {import('../types.js').Filters} Filters
 * @typedef {import('../types.js').Pagination} Pagination
 * @typedef {import('../types.js').SortOption} SortOption
 * @typedef {import('../types.js').Product} Product
 * @typedef {import('../types.js').CartItem} CartItem
 */

/**
 * @typedef {Object} AppState
 * @property {boolean} listLoading
 * @property {ProductListResponse} listResponse
 * @property {CategoryTreeNode[]} categories
 * @property {CartItem[]} cart
 * @property {number} cartItemCount
 * @property {boolean} isCartModalOpen
 * @property {Product | null} productDetail
 * @property {ProductListResponse} productDetailListResponse
 */

/** @type {AppState} */
const initialAppState = {
  listLoading: false,
  listResponse: {
    products: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: true,
      hasPrev: false,
    },
    filters: {
      search: "",
      category1: "",
      category2: "",
      sort: "price_asc",
    },
  },
  categories: [],
  isCartModalOpen: false,
  cart: [],
  cartItemCount: 1,
  productDetail: null,
  productDetailListResponse: {
    products: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: true,
      hasPrev: false,
    },
    filters: {
      search: "",
      category1: "",
      category2: "",
      sort: "price_asc",
    },
  },
};

let appState = initialAppState;

const observers = new Set();

const appStore = {
  subscribe: (observer) => {
    observers.add(observer);
    return () => observers.delete(observer);
  },
  _notify: () => {
    observers.forEach((observer) => observer(appState));
  },
  // State
  getState: () => appState,
  // Mutations
  setListResponse: (/** @type {Partial<ProductListResponse>} */ newListResponse) => {
    console.log("[Store - Mutation] setListResponse", { BEFORE: appState.listResponse, AFTER: newListResponse });
    appState.listResponse = {
      ...appState.listResponse,
      ...newListResponse,
    };
  },
  setCategories: (/** @type {CategoryTreeNode[]} */ newCategories) => {
    console.log("[Store - Mutation] setCategories", { BEFORE: appState.categories, AFTER: newCategories });
    appState.categories = newCategories;
  },
  setCart: (/** @type {CartItem[]} */ newCart) => {
    console.log("[Store - Mutation] setCart", { BEFORE: appState.cart, AFTER: newCart });
    appState.cart = newCart;
    appStore._notify();
  },
  setCartItemCount: (/** @type {number} */ newCartItemCount) => {
    console.log("[Store - Mutation] setCartItemCount", { BEFORE: appState.cartItemCount, AFTER: newCartItemCount });
    appState.cartItemCount = newCartItemCount;
  },
  setProductDetail: (/** @type {Product} */ newProductDetail) => {
    console.log("[Store - Mutation] setProductDetail", { BEFORE: appState.productDetail, AFTER: newProductDetail });
    appState.productDetail = newProductDetail;
  },
  setProductDetailListResponse: (/** @type {Partial<ProductListResponse>} */ newProductDetailListResponse) => {
    console.log("[Store - Mutation] setProductDetailListResponse", {
      BEFORE: appState.productDetailListResponse,
      AFTER: newProductDetailListResponse,
    });
    appState.productDetailListResponse = {
      ...appState.productDetailListResponse,
      ...newProductDetailListResponse,
    };
  },
  setListLoading: (/** @type {boolean} */ newListLoading) => {
    console.log("[Store - Mutation] setListLoading", { BEFORE: appState.listLoading, AFTER: newListLoading });
    appState.listLoading = newListLoading;
  },
  setIsCartModalOpen: (/** @type {boolean} */ newIsCartModalOpen) => {
    console.log("[Store - Mutation] setIsCartModalOpen", {
      BEFORE: appState.isCartModalOpen,
      AFTER: newIsCartModalOpen,
    });
    appState.isCartModalOpen = newIsCartModalOpen;
  },
  // Actions
  /**
   * @param {Omit<CartItem, 'count'>} cartItem
   * @param {number} [count=1]
   */
  addToCart: (cartItem, count = 1) => {
    console.log("[Store - Action] addToCart", { BEFORE: appState.cart, count, cartItem });
    const existingCartItem = appState.cart.find((item) => item.id === cartItem.id);
    if (existingCartItem) {
      appStore.setCart(
        appState.cart.map((item) =>
          item.id === cartItem.id ? { ...item, count: existingCartItem.count + count } : item,
        ),
      );
      console.log("[Store - Action] addToCart - 2", existingCartItem.count);
    } else {
      // appState.cart = [...appState.cart, { ...cartItem, count }];
      appStore.setCart([...appState.cart, { ...cartItem, count }]);
      console.log("[Store - Action] addToCart - 3", appState.cart);
    }
  },
  addCartItemCountByProductId: (/** @type {string} */ productId) => {
    console.log("[Store - Action] addCartItemCountByProductId", {
      BEFORE: appState.cart,
      AFTER: appState.cart.find((item) => item.id === productId)?.count,
    });
    appStore.setCart(
      appState.cart.map((item) => (item.id === productId ? { ...item, count: Math.min(item.count + 1, 999) } : item)),
    );
  },
  subtractCartItemCountByProductId: (/** @type {string} */ productId) => {
    console.log("[Store - Action] subtractCartItemCountByProductId", {
      BEFORE: appState.cart,
      AFTER: appState.cart.find((item) => item.id === productId)?.count,
    });
    appStore.setCart(
      appState.cart.map((item) => (item.id === productId ? { ...item, count: Math.max(item.count - 1, 1) } : item)),
    );
  },
  addCartItemCount: () => {
    console.log("[Store - Action] addCartItemCount", {
      BEFORE: appState.cartItemCount,
      AFTER: appState.cartItemCount + 1,
    });
    appState.cartItemCount += 1;
  },
  subtractCartItemCount: () => {
    console.log("[Store - Action] subtractCartItemCount", {
      BEFORE: appState.cartItemCount,
      AFTER: appState.cartItemCount - 1,
    });
    appState.cartItemCount -= 1;
  },
  removeSelectedCartItems: () => {
    console.log("[Store - Action] removeSelectedCartItems", {
      BEFORE: appState.cart,
      AFTER: appState.cart.map((item) => ({ ...item, selected: false })),
    });
    appStore.setCart(appState.cart.map((item) => ({ ...item, selected: false })));
  },
  removeCartItemByProductId: (/** @type {string} */ productId) => {
    console.log("[Store - Action] removeCartItemByProductId", {
      BEFORE: appState.cart,
      AFTER: appState.cart.filter((item) => item.id !== productId),
    });
    appStore.setCart(appState.cart.filter((item) => item.id !== productId));
  },
  removeAllCartItems: () => {
    console.log("[Store - Action] removeAllCartItems", {
      BEFORE: appState.cart,
      AFTER: [],
    });
    appStore.setCart([]);
  },
  reset: () => {
    console.log("[Store - Action] reset", { BEFORE: appState, AFTER: initialAppState });
    appState = initialAppState;
  },
};

export default appStore;
