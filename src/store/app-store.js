/**
 * @typedef {import('../types.js').ProductListResponse} ProductListResponse
 * @typedef {import('../types.js').CategoryTreeNode} CategoryTreeNode
 * @typedef {import('../types.js').Filters} Filters
 * @typedef {import('../types.js').Pagination} Pagination
 * @typedef {import('../types.js').SortOption} SortOption
 * @typedef {import('../types.js').Product} Product
 */

/**
 * @typedef {Object} AppState
 * @property {boolean} listLoading
 * @property {ProductListResponse} listResponse
 * @property {CategoryTreeNode[]} categories
 * @property {string[]} cart
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
  cart: [],
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
  setListResponse: (/** @type {Partial<ProductListResponse>} */ newListResponse) => {
    console.log("[Store] setListResponse", { BEFORE: appState.listResponse, AFTER: newListResponse });
    appState.listResponse = {
      ...appState.listResponse,
      ...newListResponse,
    };
  },
  setCategories: (/** @type {CategoryTreeNode[]} */ newCategories) => {
    console.log("[Store] setCategories", { BEFORE: appState.categories, AFTER: newCategories });
    appState.categories = newCategories;
  },
  setCart: (/** @type {string[]} */ newCart) => {
    console.log("[Store] setCart", { BEFORE: appState.cart, AFTER: newCart });
    appState.cart = newCart;
  },
  setProductDetail: (/** @type {Product} */ newProductDetail) => {
    console.log("[Store] setProductDetail", { BEFORE: appState.productDetail, AFTER: newProductDetail });
    appState.productDetail = newProductDetail;
  },
  setProductDetailListResponse: (/** @type {Partial<ProductListResponse>} */ newProductDetailListResponse) => {
    console.log("[Store] setProductDetailListResponse", {
      BEFORE: appState.productDetailListResponse,
      AFTER: newProductDetailListResponse,
    });
    appState.productDetailListResponse = {
      ...appState.productDetailListResponse,
      ...newProductDetailListResponse,
    };
  },
  setListLoading: (/** @type {boolean} */ newListLoading) => {
    console.log("[Store] setListLoading", { BEFORE: appState.listLoading, AFTER: newListLoading });
    appState.listLoading = newListLoading;
  },
  reset: () => {
    console.log("[Store] reset", { BEFORE: appState, AFTER: initialAppState });
    appState = initialAppState;
  },
};

export default appStore;
