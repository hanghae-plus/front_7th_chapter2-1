import { LocalStorage } from "../utils/local-storage";

const CART_STORAGE_KEY = "cart";

class CartStore {
  constructor() {
    this.observers = [];
    this.cartItems = this.init();
  }

  // TODO: Observer 상속
  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify() {
    this.observers.forEach((observer) => observer(this.cartItems));
  }

  init() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
      return [];
    }
  }

  saveToStorage() {
    try {
      LocalStorage.set(CART_STORAGE_KEY, this.cartItems);
    } catch (error) {
      console.error("Failed to save cart to storage:", error);
    }
  }

  getItems() {
    return [...this.cartItems];
  }

  addItem(product) {
    const existingItem = this.cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({ ...product, quantity: 1 });
    }

    this.saveToStorage();
    this.notify();
  }

  addQuantity(productId) {
    const item = this.cartItems.find((item) => item.id === productId);

    if (!item) return;

    item.quantity += 1;
    this.saveToStorage();
    this.notify();
  }

  minusQuantity(productId) {
    const item = this.cartItems.find((item) => item.id === productId);

    if (!item) return;
    if (item.quantity <= 1) return;

    item.quantity -= 1;
    this.saveToStorage();
    this.notify();
  }

  removeItem(productId) {
    this.cartItems = this.cartItems.filter((item) => item.id !== productId);
    this.saveToStorage();
    this.notify();
  }

  clearCart() {
    this.cartItems = [];
    this.saveToStorage();
    this.notify();
  }

  getTotalCount() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice() {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemPrice(productId) {
    const item = this.cartItems.find((item) => item.id === productId);

    if (!item) return 0;

    return item.price * item.quantity;
  }
}

export const cartStore = new CartStore();
