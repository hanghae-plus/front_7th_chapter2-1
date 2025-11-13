// TODO: Store 분리
import { createStore } from "../core/store";
import { createEventBus } from "../core/eventBus";
import { cartStorage } from "../utils/localStorage";

// 글로벌 이벤트 버스
export const eventBus = createEventBus();

// 로컬스토리지에서 초기 장바구니 데이터 로드
const initialCart = cartStorage.getCart();
const initialCartCount = cartStorage.getCartCount();

const appStore = createStore({
  // 상품 관련
  products: [],
  loading: false,
  error: null,

  // 카테고리
  categories: {},

  // 무한스크롤
  currentPage: 1,
  hasMore: true,
  totalCount: 0,
  isInfiniteScrolling: false,

  // 현재 라우트
  currentRoute: null,

  // 상세페이지
  detailProduct: null,
  detailLoading: false,
  detailError: null,
  relatedProducts: [],

  // 장바구니 (로컬스토리지에서 로드)
  cart: initialCart, // { productId, name, price, image, quantity }
  cartCount: initialCartCount,
  cartModalOpen: false,
  cartSelectedIds: [],
});

// Actions (Store를 조작하는 함수들)
export const appActions = {
  // 로딩 시작
  startLoading() {
    appStore.setState({ loading: true, error: null, products: [] });
  },

  // 상품 설정 (첫 로드)
  setProducts(products, pagination = {}) {
    appStore.setState({
      products,
      loading: false,
      error: null,
      totalCount: pagination.total || 0,
      hasMore: pagination.hasNext || false,
      currentPage: pagination.page || 1,
      isInfiniteScrolling: false,
    });
  },

  // 상품 추가 (무한스크롤)
  appendProducts(newProducts, pagination = {}) {
    const state = appStore.getState();
    appStore.setState({
      products: [...state.products, ...newProducts],
      hasMore: pagination.hasNext || false,
      currentPage: pagination.page || state.currentPage + 1,
      isInfiniteScrolling: false,
      totalCount: pagination.total || state.totalCount,
    });

    // 이벤트 발생
    eventBus.emit("products:appended", {
      count: newProducts.length,
      total: pagination.total,
    });
  },

  // 에러 설정
  setError(error) {
    appStore.setState({
      loading: false,
      error,
      isInfiniteScrolling: false,
    });

    // 이벤트 발생
    eventBus.emit("error", { message: error.message || "오류가 발생했습니다" });
  },

  // 카테고리 설정
  setCategories(categories) {
    appStore.setState({ categories });
  },

  // 상태 초기화 (필터 변경 시)
  resetProducts() {
    appStore.setState({
      products: [],
      currentPage: 1,
      hasMore: true,
      totalCount: 0,
    });
  },

  // 무한스크롤 시작
  startInfiniteScroll() {
    appStore.setState({ isInfiniteScrolling: true });
  },

  // 현재 라우트 설정
  setCurrentRoute(route) {
    appStore.setState({ currentRoute: route });
  },

  // 상세페이지 로딩 시작
  startDetailLoading() {
    appStore.setState({
      detailLoading: true,
      detailError: null,
      detailProduct: null,
      relatedProducts: [],
    });
  },

  // 상세페이지 데이터 설정
  setDetailProduct(product, relatedProducts = []) {
    appStore.setState({
      detailProduct: product,
      relatedProducts,
      detailLoading: false,
      detailError: null,
    });

    eventBus.emit("detail:loaded", { productId: product.productId });
  },

  // 상세페이지 에러 설정
  setDetailError(error) {
    appStore.setState({
      detailLoading: false,
      detailError: error,
      detailProduct: null,
    });

    eventBus.emit("error", { message: error.message || "상품 정보를 불러올 수 없습니다" });
  },

  // 장바구니 관련
  addToCart(product, quantity = 1) {
    const state = appStore.getState();
    const existingItem = state.cart.find((item) => item.productId === product.productId);

    let newCart;
    if (existingItem) {
      // 이미 있으면 수량 증가
      newCart = state.cart.map((item) =>
        item.productId === product.productId ? { ...item, quantity: item.quantity + quantity } : item,
      );
    } else {
      // 없으면 새로 추가
      newCart = [
        ...state.cart,
        {
          productId: product.productId,
          name: product.title,
          price: product.lprice,
          image: product.image,
          quantity,
        },
      ];
    }

    appStore.setState({
      cart: newCart,
      cartCount: newCart.length,
    });

    // 로컬스토리지에 저장
    cartStorage.setCart(newCart);

    eventBus.emit("cart:added", { productId: product.productId, quantity });
  },

  openCartModal() {
    appStore.setState({ cartModalOpen: true });
  },

  closeCartModal() {
    appStore.setState({ cartModalOpen: false, cartSelectedIds: [] });
  },

  toggleCartSelection(productId) {
    const state = appStore.getState();
    const isSelected = state.cartSelectedIds.includes(productId);

    appStore.setState({
      cartSelectedIds: isSelected
        ? state.cartSelectedIds.filter((id) => id !== productId)
        : [...state.cartSelectedIds, productId],
    });
  },

  selectAllCart() {
    const state = appStore.getState();
    const allIds = state.cart.map((item) => item.productId);
    appStore.setState({ cartSelectedIds: allIds });
  },

  deselectAllCart() {
    appStore.setState({ cartSelectedIds: [] });
  },

  updateCartQuantity(productId, quantity) {
    const state = appStore.getState();
    const newCart = state.cart.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
    );

    appStore.setState({ cart: newCart });

    // 로컬스토리지에 저장
    cartStorage.setCart(newCart);
  },

  removeCartItem(productId) {
    const state = appStore.getState();
    const newCart = state.cart.filter((item) => item.productId !== productId);

    appStore.setState({
      cart: newCart,
      cartCount: newCart.length,
      cartSelectedIds: state.cartSelectedIds.filter((id) => id !== productId),
    });

    // 로컬스토리지에 저장
    cartStorage.setCart(newCart);

    eventBus.emit("cart:removed", { productId });
  },

  removeSelectedCartItems() {
    const state = appStore.getState();
    const newCart = state.cart.filter((item) => !state.cartSelectedIds.includes(item.productId));

    appStore.setState({
      cart: newCart,
      cartCount: newCart.length,
      cartSelectedIds: [],
    });

    // 로컬스토리지에 저장
    cartStorage.setCart(newCart);

    eventBus.emit("cart:removed", { count: state.cartSelectedIds.length });
  },

  clearCart() {
    appStore.setState({
      cart: [],
      cartCount: 0,
      cartSelectedIds: [],
    });

    // 로컬스토리지에서 제거
    cartStorage.clearCart();

    eventBus.emit("cart:cleared");
  },
};

// 구독은 외부에서 하도록 export만
export default appStore;
