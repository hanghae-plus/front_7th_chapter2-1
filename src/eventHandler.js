import { router } from "./router/Router.js";
import { store } from "./store/store.js";

import { getProducts, getProduct } from "./api/productApi.js";

/**
 * 전역 이벤트 핸들러 (한 번만 등록)
 */
export const initGlobalEventHandlers = () => {
  // document에 단 한 번만 이벤트 리스너 등록
  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("change", handleGlobalChange);
};

const handleRetryFetch = () => {
  store.setState({ isLoading: true, isError: false });
  getProducts()
    .then((data) => {
      store.setState({ ...data, isLoading: false });
    })
    .catch(() => {
      store.setState({ isError: true, isLoading: false, toast: { isOpen: true, type: "error" } });
    });
};

const handleGetProductFetch = (productId) => {
  store.setState({ isLoading: true, isError: false });
  getProduct(productId)
    .then((selectedProduct) => {
      store.setState({ selectedProduct, isLoading: false });
    })
    .catch(() => {
      store.setState({ isError: true, isLoading: false, toast: { isOpen: true, type: "error" } });
    });
};

const handleGlobalClick = (e) => {
  const target = e.target;

  // 뒤로가기 버튼
  if (target.closest("#back-btn")) {
    window.history.back();
  }

  // 다시 시도 버튼
  if (target.closest("#retry-fetch-btn")) {
    handleRetryFetch();
    return;
  }

  // 장바구니 열기 버튼
  if (target.closest("#cart-open-btn")) {
    const cart = store.getState("cart");
    if (cart.isOpen) return;

    store.setState({ cart: { ...cart, isOpen: true } });
    return;
  }

  // 장바구니 닫기 버튼
  if (target.closest("#cart-modal-close-btn") || target.closest(".cart-modal-overlay")) {
    const cart = store.getState("cart");
    if (!cart.isOpen) return;

    store.setState({ cart: { ...cart, isOpen: false } });
    return;
  }

  // 장바구니 담기 버튼
  if (target.closest(".add-to-cart-btn") || target.closest("#add-to-cart-btn")) {
    e.stopPropagation();
    addCartItem(target.dataset.productId);
    store.setState({ toast: { isOpen: true, type: "success" } });
  }

  // 상품 카드 클릭
  if (target.closest(".product-card")) {
    if (target.closest(".add-to-cart-btn")) return;
    const productCard = target.closest("[data-product-id]");
    const productId = productCard.dataset.productId;

    handleGetProductFetch(productId);
    router.navigate(`product/${productId}`);
    return;
  }

  // 상품 목록으로 돌아가기
  if (target.closest(".go-to-product-list")) {
    router.navigate(import.meta.env.BASE_URL === "/" ? "/" : "");
    return;
  }

  // 토스트 닫기
  if (target.closest("#toast-close-btn")) {
    store.setState({ toast: { isOpen: false } });
    return;
  }

  // 수량 증가
  if (target.matches("#quantity-increase")) {
    const cart = store.getState("cart");
    store.setState({ cart: { ...cart, quantity: cart.quantity + 1 } });
  }

  // 수량 감소
  if (target.matches("#quantity-decrease")) {
    const cart = store.getState("cart");
    if (cart.quantity <= 1) return;

    store.setState({ cart: { ...cart, quantity: cart.quantity - 1 } });
  }
};

const addCartItem = (targetId) => {
  const { products, cart } = store.getState();
  if (cart.list.get(targetId)) return;

  const { image, lprice, title } = products.find(({ productId }) => productId === targetId);
  const newList = cart.list.set(targetId, {
    productId: targetId,
    image,
    lprice,
    title,
    quantity: 1,
    selected: false,
  });

  store.setState({ cart: { ...cart, list: newList } });
  store.setState({ toast: { isOpen: true, type: "success" } });
};

const handleGlobalChange = (e) => {
  const target = e.target;

  // 페이지당 상품 수 변경
  if (target.matches("#limit-select")) {
    const pagination = store.getState("pagination");
    const limit = +target.value;

    if (pagination.limit === limit) return;

    store.setState({ pagination: { ...pagination, limit } });
    return;
  }

  // 정렬 변경
  if (target.matches("#sort-select")) {
    const filters = store.getState("filters");

    if (filters.sort === target.value) return;

    store.setState({ filters: { ...filters, sort: target.value } });
    return;
  }
};

// input 이벤트는 별도로 관리
export const initInputHandlers = () => {
  document.addEventListener("input", handleGlobalInput);
};

const handleGlobalInput = (e) => {
  const target = e.target;

  // 검색창 입력
  if (target.matches("#search-input")) {
    // debounce 처리
    handleSearch(target.value);
  }

  // 수량 입력
  if (target.matches("#quantity-input")) {
    const productId = target.dataset.productId;
    const quantity = +target.value;
    const cart = store.getState("cart");
    const cartItem = cart.list.get(productId);
    if (!cartItem) return;
    const newList = cart.list.set(productId, { ...cartItem, quantity });
    store.setState({ cart: { ...cart, list: newList } });
  }
};

const handleSearch = (value) => {
  const filters = store.getState("filters");
  if (filters.search === value) return;
  store.setState({ filters: { ...filters, search: value } });
};
