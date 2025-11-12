import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { Store } from "./core/Store.js";

export const store = new Store({
  state: {
    products: [],
    categories: [],
    cart: [],
    filters: {
      search: "",
      categories: [],
      category1: "",
      category2: "",
      isSubItem: false,
      limit: 20,
      sort: "price_asc",
    },
    currentPage: 1,
    totalCount: 0,
    hasNext: true,
    hasPrev: false,
    isLoading: false,
    detailProduct: {},
    relatedProducts: [],
    isMain: true,
  },

  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },

    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },

    SET_CART(state, cart) {
      state.cart = cart;
    },

    ADD_TO_CART(state, productId) {
      if (!state.cart.includes(productId)) {
        state.cart.push(productId);
      }
    },

    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },

    SET_CURRENT_PAGE(state, page) {
      state.currentPage = page;
    },

    SET_TOTAL_COUNT(state, count) {
      state.totalCount = count;
    },

    SET_HAS_NEXT(state, hasNext) {
      state.hasNext = hasNext;
    },

    SET_HAS_PREV(state, hasPrev) {
      state.hasPrev = hasPrev;
    },

    SET_IS_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },

    SET_DETAIL_PRODUCT(state, product) {
      state.detailProduct = product;
    },

    SET_IS_MAIN(state, isMain) {
      state.isMain = isMain;
    },

    APPEND_PRODUCTS(state, products) {
      state.products = [...state.products, ...products];
    },

    SET_RELATED_PRODUCTS(state, products) {
      state.relatedProducts = products;
    },

    SET_FILTER_CATEGORIES(state, categories) {
      state.filters.categories = categories;
    },

    SET_IS_SUB_ITEM(state, isSubItem) {
      state.filters.isSubItem = isSubItem;
    },
  },

  actions: {
    async loadProducts({ commit, state }) {
      commit("SET_IS_LOADING", true);
      try {
        const response = await getProducts({
          page: state.currentPage,
          ...state.filters,
        });

        if (state.currentPage === 1) {
          commit("SET_PRODUCTS", response.products);
        } else {
          commit("APPEND_PRODUCTS", response.products);
        }

        commit("SET_TOTAL_COUNT", response.totalCount);
        commit("SET_HAS_NEXT", response.hasNext);
        commit("SET_HAS_PREV", response.hasPrev);
      } catch (error) {
        console.error("상품을 불러오는데 실패했습니다:", error);
      } finally {
        commit("SET_IS_LOADING", false);
      }
    },

    async loadCategories({ commit }) {
      try {
        const categories = await getCategories();
        commit("SET_CATEGORIES", categories);
        commit("SET_FILTER_CATEGORIES", Object.keys(categories));
        commit("SET_IS_SUB_ITEM", false);
      } catch (error) {
        console.error("카테고리를 불러오는데 실패했습니다:", error);
      }
    },

    async loadProductDetail({ commit }, productId) {
      commit("SET_IS_LOADING", true);
      try {
        const product = await getProduct(productId);
        commit("SET_DETAIL_PRODUCT", product);
      } catch (error) {
        console.error("상품 상세를 불러오는데 실패했습니다:", error);
      } finally {
        commit("SET_IS_LOADING", false);
      }
    },

    initCart({ commit }) {
      const localStorageCart = window.localStorage.getItem("shopping_cart");
      const cart = localStorageCart ? JSON.parse(localStorageCart) : [];
      commit("SET_CART", cart);
    },

    addToCart({ commit, state }, productId) {
      if (state.cart.includes(productId)) {
        return false;
      }
      commit("ADD_TO_CART", productId);
      window.localStorage.setItem("shopping_cart", JSON.stringify(state.cart));
      return true;
    },
  },
});
