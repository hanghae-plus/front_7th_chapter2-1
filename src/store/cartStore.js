const CART_STORAGE_KEY = "shopping_cart";

const loadStoredCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("장바구니 정보를 불러오는 중 오류가 발생했습니다.", error);
    return [];
  }
};

export const cartStore = {
  state: { cart: loadStoredCart() },
  observers: [],
  subscribe(observerFn) {
    if (typeof observerFn !== "function") return () => {};

    this.observers.push(observerFn);
    observerFn(this.state.cart);

    return () => {
      this.observers = this.observers.filter((observer) => observer !== observerFn);
    };
  },
  notify() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.state.cart));

    this.observers.forEach((observerFn) => observerFn(this.state.cart));
  },
  getTotalCount() {
    return this.state.cart.length;
  },
  getTotalAmount() {
    let total = 0;
    this.state.cart.forEach((item) => {
      total += item.lprice * item.quantity;
    });
    return total;
  },
  addToCart(product) {
    const existingItem = this.state.cart.find((item) => item.productId === product.productId);
    if (existingItem) {
      console.log("장바구니 갯수 추가:", existingItem.productId);
      existingItem.quantity += 1;
    } else {
      console.log("장바구니 신규 추가:", product.productId);
      const cartItem = {
        productId: product.productId,
        title: product.title || "",
        image: product.image || "",
        lprice: product.lprice || 0,
        quantity: product.quantity || 1,
      };
      this.state.cart.push(cartItem);
    }
    this.notify();
  },
  decreaseQuantity(productId) {
    const item = this.state.cart.find((item) => item.productId === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.notify();
    }
  },
  removeProducts(productIds) {
    productIds = Array.isArray(productIds) ? productIds : [productIds];
    this.state.cart = this.state.cart.filter((item) => !productIds.includes(item.productId));
    this.notify();
  },

  clearCart() {
    this.state.cart = [];
    this.notify();
  },
};
