// 전역 상태 관리
import { createObserver } from "./observer.js";
import { getProducts, getProduct, getCategories } from "../api/productApi.js";

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
      // response의 각 필드를 개별적으로 업데이트
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
};
