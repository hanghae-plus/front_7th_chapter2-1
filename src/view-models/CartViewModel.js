/**
 * @typedef {import('../types.js').CartItem} CartItem
 */

export class CartViewModel {
  /**
   * @param {CartItem[]} cart
   */
  constructor(cart = []) {
    this.cart = cart;
  }

  getTotalCount() {
    return this.cart.reduce((acc, item) => acc + item.count, 0);
  }
}
