import { ADD_CART_LIST, getLocalStorage, setLocalStorage } from "../utils/localstorage";

export const cartState = {
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
  },

  unsubscribe(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  },

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error(error);
      }
    });
  },

  updateCart(data) {
    setLocalStorage(ADD_CART_LIST, data);
    this.notify();
  },

  getCart() {
    return getLocalStorage(ADD_CART_LIST);
  },

  toggleSelectAll() {
    const storedData = this.getCart();
    const newSelectedAll = !storedData.selectedAll;
    const updatedItems = storedData.items.map((item) => ({
      ...item,
      selected: newSelectedAll,
    }));
    this.updateCart({ items: updatedItems, selectedAll: newSelectedAll });
  },

  toggleItemSelect(productId) {
    const storedData = this.getCart();
    const updatedItems = storedData.items.map((item) => {
      if (item.id === productId) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });

    const allSelected = updatedItems.every((item) => item.selected);
    this.updateCart({ items: updatedItems, selectedAll: allSelected });
  },

  increaseQuantity(productId) {
    const storedData = this.getCart();
    const updatedItems = storedData.items.map((item) => {
      if (item.id === productId && item.quantity < 107) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    this.updateCart({ ...storedData, items: updatedItems });
  },

  decreaseQuantity(productId) {
    const storedData = this.getCart();
    const updatedItems = storedData.items.map((item) => {
      if (item.id === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    this.updateCart({ ...storedData, items: updatedItems });
  },

  removeItem(productId) {
    const storedData = this.getCart();
    const updatedItems = storedData.items.filter((item) => item.id !== productId);
    this.updateCart({ ...storedData, items: updatedItems });
  },

  removeSelectedItems() {
    const storedData = this.getCart();
    const updatedItems = storedData.items.filter((item) => !item.selected);
    this.updateCart({ ...storedData, items: updatedItems });
  },

  clearCart() {
    this.updateCart({ items: [], selectedAll: false });
  },
};
