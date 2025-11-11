// 전역 상태 관리
import { createObserver } from "./observer.js";
import { getProducts, getProduct } from "../api/productApi.js";

const observer = createObserver(); // 옵저버 인스턴스 생성

export const store = {
  state: {
    list: {
      products: [],
      categories: [],
      category1: "",
      category2: "",
      loading: false,
      error: null,
      limit: 0,
    },
    detail: {
      product: null,
      loading: false,
      relatedProducts: [],
      error: null,
    },
  },
  subscribe: observer.subscribe,
  notify: observer.notify,

  setState(newState) {
    this.state = {
      ...this.state,
      list: { ...this.state.list, ...newState.list },
      detail: { ...this.state.detail, ...newState.detail },
    };
    observer.notify(); // 상태 바뀌면 알림
  },

  async fetchProducts() {
    try {
      this.setState({ list: { ...this.state.list, loading: true, error: null } });
      const response = await getProducts(this.state.list);
      console.log(response);
      this.setState({ list: { ...this.state.list, ...response, loading: false } });
      console.log(this.state.list);
    } catch (error) {
      this.setState({ list: { ...this.state.list, error, loading: false } });
    }
  },

  async fetchProductDetail(productId) {
    try {
      this.setState({ detail: { ...this.state.detail, loading: true, error: null } });
      const response = await getProduct(productId);
      this.setState({ detail: { ...this.state.detail, ...response, loading: false } });
    } catch (error) {
      this.setState({ detail: { ...this.state.detail, error, loading: false } });
    }
  },
};
