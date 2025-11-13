import { LocalStorage } from "../utils/local-storage";
import { Observer } from "../core/Observer";

const CART_STORAGE_KEY = "shopping_cart";

class CartStore extends Observer {
  constructor() {
    super();
    this.cartItems = [];
    this.selectedItemIds = [];

    this.init();
  }

  init() {
    const cartStorage = LocalStorage.get(CART_STORAGE_KEY) || {
      cartItems: [],
      selectedItemIds: [],
    };
    const { cartItems, selectedItemIds } = cartStorage;
    this.cartItems = cartItems ?? [];
    this.selectedItemIds = selectedItemIds ?? [];
  }

  saveToStorage() {
    LocalStorage.set(CART_STORAGE_KEY, {
      cartItems: this.cartItems,
      selectedItemIds: this.selectedItemIds,
    });
  }

  getItems() {
    return [...this.cartItems];
  }

  addItem(product, quantity = 1) {
    const existingItem = this.cartItems.find((item) => item.productId === product.productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ ...product, quantity });
    }

    this.saveToStorage();
    this.notify(this.cartItems);
  }

  addQuantity(productId) {
    const item = this.cartItems.find((item) => item.productId === productId);

    if (!item) return;

    item.quantity += 1;
    this.saveToStorage();
    this.notify(this.cartItems);
  }

  minusQuantity(productId) {
    const item = this.cartItems.find((item) => item.productId === productId);

    if (!item) return;
    if (item.quantity <= 1) return;

    item.quantity -= 1;
    this.saveToStorage();
    this.notify(this.cartItems);
  }

  toggleSelectItem(productId) {
    console.log("1", this.selectedItemIds);
    if (this.selectedItemIds.includes(productId)) {
      this.selectedItemIds = this.selectedItemIds.filter((id) => id !== productId);
    } else {
      this.selectedItemIds.push(productId);
    }
    console.log("2", this.selectedItemIds);

    this.saveToStorage();
    this.notify(this.cartItems);
  }

  toggleSelectAll() {
    if (this.selectedItemIds.length === this.cartItems.length) {
      this.selectedItemIds = [];
    } else {
      this.selectedItemIds = this.cartItems.map((item) => item.productId);
    }
    this.saveToStorage();
    this.notify(this.cartItems);
  }

  removeItem(productId) {
    this.cartItems = this.cartItems.filter((item) => item.productId !== productId);
    this.selectedItemIds = this.selectedItemIds.filter((id) => id !== productId);
    this.saveToStorage();
    this.notify(this.cartItems);
  }

  removeSelectedItems() {
    this.cartItems = this.cartItems.filter((item) => !this.selectedItemIds.includes(item.productId));
    this.selectedItemIds = [];
    this.saveToStorage();
    this.notify(this.cartItems);
  }

  clearCart() {
    this.cartItems = [];
    this.selectedItemIds = [];
    this.saveToStorage();
    this.notify(this.cartItems);
  }

  getTotalCount() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSelectedItemsSize() {
    return this.selectedItemIds.length;
  }

  isAllSelected() {
    return this.selectedItemIds.length === this.cartItems.length;
  }

  isSelected(productId) {
    return this.selectedItemIds.includes(productId);
  }

  getItemsSize() {
    return this.cartItems.length;
  }

  getTotalPrice() {
    return this.cartItems.reduce((sum, item) => sum + item.lprice * item.quantity, 0);
  }

  getItemPrice(productId) {
    const item = this.cartItems.find((item) => item.productId === productId);

    if (!item) return 0;

    return item.lprice * item.quantity;
  }

  getSelectedItemsPrice() {
    return this.cartItems
      .filter((item) => this.selectedItemIds.includes(item.productId))
      .reduce((sum, item) => sum + item.lprice * item.quantity, 0);
  }
}

export const cartStore = new CartStore();
