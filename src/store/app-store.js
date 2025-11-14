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
 * @property {CartItem[]} cart
 * @property {boolean} allSelected
 */

/** @type {AppState} */
const initialAppState = {
  cart: [],
  allSelected: false,
};

const STORAGE_KEY = "shopping_cart";

const loadStateFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[Store] Failed to load from localStorage:", error);
  }
  return initialAppState;
};

const saveStateToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("[Store] Failed to save to localStorage:", error);
  }
};

let appState = loadStateFromStorage();

const observers = new Set();

const appStore = {
  subscribe: (observer) => {
    observers.add(observer);
    return () => observers.delete(observer);
  },
  _notify: () => {
    observers.forEach((observer) => observer(appState));
    saveStateToStorage(appState);
  },
  // State
  getState: () => appState,
  // Mutations
  setCart: (/** @type {CartItem[]} */ newCart) => {
    console.log("[Store - Mutation] setCart", { BEFORE: appState.cart, AFTER: newCart });
    appState.cart = newCart;
    appStore._notify();
  },
  setAllSelected: (/** @type {boolean} */ newAllSelected) => {
    console.log("[Store - Mutation] setAllSelected", { BEFORE: appState.allSelected, AFTER: newAllSelected });
    appState.allSelected = newAllSelected;
    appStore._notify();
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
