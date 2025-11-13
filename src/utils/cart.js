import { ToastManager } from "../../../../항해99/front_7th_chapter2-1/src/utils/toast";

export class CartUtil {
  static addCard(product) {
    const existCartItems = JSON.parse(localStorage.getItem("shopping_cart") ?? "{}")?.items ?? [];
    const existCartItem = existCartItems.find((item) => item.id === product.productId);
    if (existCartItem) {
      existCartItem.quantity = existCartItem.quantity + 1;
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
    localStorage.setItem(
      "shopping_cart",
      JSON.stringify({
        items: existCartItems,
      }),
    );

    ToastManager.show("add");
  }

  static removeCart() {}
}
