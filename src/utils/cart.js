import { ToastManager } from "../../../../항해99/front_7th_chapter2-1/src/utils/toast";
import { LocalStorageUtil } from "./localstorage";

export class CartUtil {
  static addCard(product, count = 1) {
    const existCartItems = JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? [];
    const existCartItem = existCartItems.find((item) => item.id === product.productId);

    if (existCartItem) {
      existCartItem.quantity = existCartItem.quantity + count;
    } else {
      existCartItems.push({
        id: product.productId,
        title: product.title,
        price: product.lprice,
        quantity: 1,
        image: product.image,
        selected: false,
      });
    }

    LocalStorageUtil.setItem(
      "shopping_cart",
      JSON.stringify({
        items: existCartItems,
      }),
    );

    ToastManager.show({ type: "success", message: "장바구니에 추가되었습니다" });
  }

  static updateQuantity(productId, count) {
    const existCartItems = JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? [];
    const existCartItem = existCartItems.find((item) => item.id === productId);
    existCartItem.quantity = count;
    LocalStorageUtil.setItem(
      "shopping_cart",
      JSON.stringify({
        items: existCartItems,
      }),
    );
  }

  static getCartItems() {
    return JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? [];
  }

  static getCartItem(productId) {
    return (JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? []).find(
      (prod) => prod.id === productId,
    );
  }

  static checkCartItem(productId) {
    const existCartItems = JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? [];
    const existCartItem = existCartItems.find((prod) => prod.id === productId);
    existCartItem.selected = existCartItem.selected === true ? false : true;
    LocalStorageUtil.setItem(
      "shopping_cart",
      JSON.stringify({
        items: existCartItems,
      }),
    );
  }

  static checkAllCartItems(checked) {
    const existCartItems = JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? [];
    existCartItems.forEach((item) => {
      item.selected = checked;
    });
    LocalStorageUtil.setItem(
      "shopping_cart",
      JSON.stringify({
        items: existCartItems,
      }),
    );
  }

  static removeCartItem(productId) {
    const existCartItems = JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? [];
    const filteredItems = existCartItems.filter((item) => item.id !== productId);
    LocalStorageUtil.setItem(
      "shopping_cart",
      JSON.stringify({
        items: filteredItems,
      }),
    );
  }

  static removeSelectedCartItems() {
    const existCartItems = JSON.parse(LocalStorageUtil.getItem("shopping_cart") ?? "{}")?.items ?? [];
    const filteredItems = existCartItems.filter((item) => !item.selected);
    LocalStorageUtil.setItem(
      "shopping_cart",
      JSON.stringify({
        items: filteredItems,
      }),
    );

    ToastManager.show({ type: "info", message: "선택된 상품들이 삭제되었습니다" });
  }

  static removeAllCartItems() {
    LocalStorageUtil.clear();
    ToastManager.show({ type: "info", message: "장바구니가 비워졌습니다" });
  }
}
