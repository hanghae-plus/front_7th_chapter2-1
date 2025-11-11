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
};

let appState = initialAppState;

const appStore = {
  getState: () => appState,
  setListResponse: (/** @type {Partial<ProductListResponse>} */ newListResponse) => {
    appState.listResponse = {
      ...appState.listResponse,
      ...newListResponse,
    };
  },
  setCategories: (/** @type {CategoryTreeNode[]} */ newCategories) => {
    appState.categories = newCategories;
  },
  setCart: (/** @type {string[]} */ newCart) => {
    appState.cart = newCart;
  },
  setProductDetail: (/** @type {Product} */ newProductDetail) => {
    appState.productDetail = newProductDetail;
  },
  setListLoading: (/** @type {boolean} */ newListLoading) => {
    appState.listLoading = newListLoading;
  },
  reset: () => {
    appState = initialAppState;
  },
};

export default appStore;
