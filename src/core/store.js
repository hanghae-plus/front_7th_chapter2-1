// 전역 상태 관리
import { createObserver } from "./observer.js";
import { getProducts, getProduct, getCategories } from "../api/productApi.js";
import {
  loadCartFromStorage,
  addToCart as addToCartUtil,
  updateCartItemQuantity,
  removeFromCart as removeFromCartUtil,
  clearCart as clearCartUtil,
  getCartTotal,
  getCartItemCount,
} from "../utils/cart.js";

const observer = createObserver(); // 옵저버 인스턴스 생성

export const store = {
  state: {
    list: {
      products: [],
      categories: [],
      category1: "",
      category2: "",
      loading: false,
      filters: [],
      pagination: [],
      error: null,
      limit: 20,
      sort: "price_asc",
      search: "",
    },
    detail: {
      product: null,
      loading: false,
      relatedProducts: [],
      error: null,
    },
    cart: {
      items: [],
      total: 0,
      count: 0,
    },
  },
  subscribe: observer.subscribe,
  unsubscribe: observer.unsubscribe,
  notify: observer.notify,

  setState(key, value) {
    // key 형태: 'list.products', 'detail.loading' 등으로 받아오기
    const [topKey, nestedKey] = key.split(".");

    if (nestedKey) {
      // 중첩된 경로: list.products
      this.state[topKey] = { ...this.state[topKey], [nestedKey]: value };
    } else {
      // 최상위 경로 (거의 사용 X)
      this.state[key] = value;
    }

    // 해당 경로 구독자에게만 알림
    observer.notify(key);
  },

  async fetchProducts() {
    try {
      this.setState("list.loading", true);
      this.setState("list.error", null);
      const response = await getProducts(this.state.list);

      Object.keys(response).forEach((key) => {
        this.setState(`list.${key}`, response[key]);
      });
      this.setState("list.loading", false);
    } catch (error) {
      this.setState("list.error", error);
      this.setState("list.loading", false);
    }
  },

  async fetchProductDetail(productId) {
    try {
      this.setState("detail.loading", true);
      this.setState("detail.error", null);
      const response = await getProduct(productId);
      this.setState("detail.product", response);
      this.setState("detail.loading", false);
    } catch (error) {
      this.setState("detail.error", error);
      this.setState("detail.loading", false);
    }
  },

  async fetchCategories() {
    try {
      this.setState("list.loading", true);
      this.setState("list.categories", true);
      this.setState("list.error", null);
      const response = await getCategories();
      this.setState("list.categories", response);
      this.setState("list.loading", false);
    } catch (error) {
      this.setState("list.error", error);
      this.setState("list.loading", false);
    }
  },

  // 장바구니 초기화 (localStorage에서 로드)
  initCart() {
    const cartItems = loadCartFromStorage();
    this.setState("cart.items", cartItems);
    this.setState("cart.total", getCartTotal(cartItems));
    this.setState("cart.count", getCartItemCount(cartItems));
    console.log("🛒 장바구니 초기화 완료:", cartItems);
  },

  // 장바구니에 상품 추가
  addToCart(product, quantity) {
    const updatedCart = addToCartUtil(product, quantity);
    this.setState("cart.items", updatedCart);
    this.setState("cart.total", getCartTotal(updatedCart));
    this.setState("cart.count", getCartItemCount(updatedCart));
    console.log("🛒 장바구니 상태 업데이트:", this.state.cart);
  },

  // 장바구니 상품 수량 변경
  updateCartQuantity(productId, quantity) {
    const updatedCart = updateCartItemQuantity(productId, quantity);
    this.setState("cart.items", updatedCart);
    this.setState("cart.total", getCartTotal(updatedCart));
    this.setState("cart.count", getCartItemCount(updatedCart));
  },

  // 장바구니에서 상품 제거
  removeFromCart(productId) {
    const updatedCart = removeFromCartUtil(productId);
    this.setState("cart.items", updatedCart);
    this.setState("cart.total", getCartTotal(updatedCart));
    this.setState("cart.count", getCartItemCount(updatedCart));
  },

  // 장바구니 비우기
  clearCart() {
    const updatedCart = clearCartUtil();
    this.setState("cart.items", updatedCart);
    this.setState("cart.total", 0);
    this.setState("cart.count", 0);
  },
};
