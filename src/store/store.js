import { getCategories, getProduct, getProducts } from "../api/productApi.js";
import { Store } from "./core.js";

/** @typedef {import("../types/product.type.js").ProductDetail} ProductDetail */
/** @typedef {import("../types/product.type.js").Product} Product */

const initialFilters = {
  limit: 20,
  search: "",
  category1: "",
  category2: "",
  sort: "price_asc",
};

// 전역 상태 정의
export const store = new Store({
  products: /** @type {Product[]} */ ([]),
  product: /** @type {ProductDetail} */ ({}),
  cart: [],
  currentPage: "/",
  isFetching: true,
  categories: {},
  pagination: {
    // hasNext: true,
    // hasPrev: false,
    // limit: 20,
    // page: 1,
    total: 340,
    // totalPages: 17,
  },
  filters: Object.assign({}, initialFilters),
  // 장바구니
  status: "initial",
});

// 액션 함수들 (상태 변경 로직)
export const actions = {
  // 상태 초기화
  setInitialFilters(filters) {
    store.setState({ filters });
  },

  // api 상태
  setStatus(status) {
    store.setState({ status });
  },

  // 상품 목록 설정
  setProducts(products) {
    store.setState({ products });
  },

  // 상품 상세 설정
  setProduct(product) {
    store.setState({ product });
  },

  // 페이지네이션 설정
  setPagination(pagination) {
    store.setState({ pagination });
  },

  // 카테고리 선택
  setFilters(filters) {
    const newFilters = Object.assign({}, store.state.filters, filters);
    const searchParams = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    const newUrl = queryString ? `${location.pathname}?${queryString}` : location.pathname;
    window.history.replaceState({}, "", newUrl);

    store.setState({ filters: newFilters });
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

  // 장바구니
  setIsOpen(isOpen) {
    console.log("setIsOpen", isOpen);
    store.setState({ isOpen });
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
};

// 디스패치 함수
export const dispatch = {
  // product, isFetching 상태 변경
  async fetchProducts(params) {
    actions.setIsFetching(true);

    try {
      const { products, filters, pagination } = await getProducts({ ...store.state.filters, ...params });
      if (!Object.keys(store.state.categories).length) {
        // 필터 바뀔 일 없어서 1번만 호출
        const data = await getCategories(params);
        actions.setCategories(data);
      }

      if (pagination.page === 1 || store.state.pagination.page === pagination.page) {
        actions.setProducts(products);
      } else {
        actions.setProducts(store.state.products.concat(products));
      }
      actions.setStatus("success");
      actions.setFilters(filters);
      actions.setPagination(pagination);
    } catch (error) {
      actions.setStatus("error");
      console.error("Failed to fetch products", error);
      throw error;
    } finally {
      actions.setIsFetching(false);
    }
  },
  async fetchProduct(productId) {
    actions.setIsFetching(true);

    try {
      const response = await getProduct(productId);

      actions.setProduct({ ...response, quantity: 1 });
    } catch (error) {
      console.error("Failed to fetch products", error);
      throw error;
    } finally {
      actions.setIsFetching(false);
    }
  },
};
