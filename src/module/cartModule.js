export const addToCart = (product, quantity = 1) => {
  const currentCart = getCart();
  const index = currentCart.findIndex((item) => item.productId === product.productId);
  const newCart = [...currentCart];

  if (index < 0) {
    newCart.push({ ...product, quantity });
  } else {
    newCart[index].quantity += quantity;
  }

  localStorage.setItem("cart", JSON.stringify(newCart));
};

/**
 * 카트 수량 수정
 * @param {string} productId - 상품 ID
 * @param {string} type - 수정 타입 (increase, decrease)
 */
export const editCartQuantity = (productId, type) => {
  const currentCart = getCart();
  const index = currentCart.findIndex((item) => item.productId === productId);
  const newCart = [...currentCart];

  if (index < 0) return;

  if (type === "increase") {
    newCart[index].quantity += 1;
  } else {
    newCart[index].quantity -= 1;
  }

  localStorage.setItem("cart", JSON.stringify(newCart));
};

export const getCart = () => {
  const currentCart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
  return currentCart;
};

export const removeFromCart = (productId) => {
  const currentCart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
  localStorage.setItem("cart", JSON.stringify(currentCart.filter((item) => item.productId !== productId)));
};

export const removeAllFromCart = () => {
  localStorage.removeItem("cart");
};
