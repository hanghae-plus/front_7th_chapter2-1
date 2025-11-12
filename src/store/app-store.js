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
 * @property {string[]} selectedCartIds
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
  selectedCartIds: [],
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

const appStore = {
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
  },
  setCartItemCount: (/** @type {number} */ newCartItemCount) => {
    console.log("[Store - Mutation] setCartItemCount", { BEFORE: appState.cartItemCount, AFTER: newCartItemCount });
    appState.cartItemCount = newCartItemCount;
  },
  setSelectedCartIds: (/** @type {string[]} */ newSelectedCartIds) => {
    console.log("[Store - Mutation] setSelectedCartIds", {
      BEFORE: appState.selectedCartIds,
      AFTER: newSelectedCartIds,
    });
    appState.selectedCartIds = newSelectedCartIds;
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
   * @param {string} productId
   * @param {number} [count=1]
   */
  addToCart: (productId, count = 1) => {
    console.log("[Store - Action] addToCart", { BEFORE: appState.cart });
    const existingCartItem = appState.cart.find((item) => item.productId === productId);
    if (existingCartItem) {
      existingCartItem.count += count;
    } else {
      appState.cart = [...appState.cart, { productId, count }];
    }
  },
  addCartItemCountByProductId: (/** @type {string} */ productId) => {
    console.log("[Store - Action] addCartItemCountByProductId", {
      BEFORE: appState.cart,
      AFTER: appState.cart.find((item) => item.productId === productId)?.count,
    });
    appState.cart = appState.cart.map((item) =>
      item.productId === productId ? { ...item, count: Math.min(item.count + 1, 999) } : item,
    );
  },
  subtractCartItemCountByProductId: (/** @type {string} */ productId) => {
    console.log("[Store - Action] subtractCartItemCountByProductId", {
      BEFORE: appState.cart,
      AFTER: appState.cart.find((item) => item.productId === productId)?.count,
    });
    appState.cart = appState.cart.map((item) =>
      item.productId === productId ? { ...item, count: Math.max(item.count - 1, 1) } : item,
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
  reset: () => {
    console.log("[Store - Action] reset", { BEFORE: appState, AFTER: initialAppState });
    appState = initialAppState;
  },
};

export default appStore;
