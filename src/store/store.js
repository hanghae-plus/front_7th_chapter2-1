import { getCategories, getProducts } from "../api/productApi.js";
import { Store } from "./core.js";

// 전역 상태 정의

export const store = new Store({
  products: [],
  cart: [],
  currentPage: "/",
  isFetching: true,
  categories: {},
  filters: {
    search: "",
    category1: "",
    category2: "",
    sort: "price_asc",
  },
});

// 액션 함수들 (상태 변경 로직)
export const actions = {
  // 상품 목록 설정
  setProducts(products) {
    store.setState({ products });
  },

  // 카테고리 선택
  setFilters(filters) {
    store.setState({ filters: Object.assign({}, store.state.filters, filters) });
    console.log("filters-->", store.state.filters);
  },

  // 장바구니에 상품 추가
  addToCart(product) {
    const currentCart = store.state.cart;
    const existingItem = currentCart.find((item) => item.id === product.id);

    if (existingItem) {
      // 이미 있는 상품이면 수량 증가
      const updatedCart = currentCart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
      store.setState({ cart: updatedCart });
    } else {
      // 새 상품 추가
      store.setState({
        cart: [...currentCart, { ...product, quantity: 1 }],
      });
    }
  },

  // 장바구니에서 상품 제거
  removeFromCart(productId) {
    const updatedCart = store.state.cart.filter((item) => item.id !== productId);
    store.setState({ cart: updatedCart });
  },

  // 페이지 변경
  setCurrentPage(page) {
    store.setState({ currentPage: page });
  },

  // 카테고리 변경
  setCategories(categories) {
    store.setState({ categories });
  },

  // 로딩 상태 변경
  setIsFetching(isFetching) {
    store.setState({ isFetching });
  },
};

// 디스패치 함수
export const dispatch = {
  // product, isFetching 상태 변경
  async fetchProducts(params) {
    actions.setIsFetching(true);

    try {
      const { products } = await getProducts(params);
      const data = await getCategories(params);
      console.log("data-->", data);
      actions.setCategories(data);
      actions.setProducts(products);
    } catch (error) {
      console.error("Failed to fetch products", error);
      throw error;
    } finally {
      actions.setIsFetching(false);
    }
  },
};
