const CART_STORAGE_KEY = "shopping_cart";

export function getCart() {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : {};
  } catch (error) {
    console.error("장바구니 로드 실패:", error);
    return {};
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("장바구니 저장 실패:", error);
  }
}

export function addToCart(productId, productData = null, quantity = 1) {
  const cart = getCart();

  if (cart[productId]) {
    cart[productId].quantity += quantity;
  } else {
    cart[productId] = {
      productId,
      quantity,
      ...(productData && { productData }),
    };
  }

  saveCart(cart);
  updateCartIcon();
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
  updateCartIcon();
  return cart;
}

export function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  if (cart[productId]) {
    if (quantity <= 0) {
      delete cart[productId];
    } else {
      cart[productId].quantity = quantity;
    }
    saveCart(cart);
    updateCartIcon();
  }
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartIcon();
}

export function getCartItemCount() {
  const cart = getCart();
  return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
}

export function updateCartIcon() {
  const cartIconBtn = document.getElementById("cart-icon-btn");
  if (!cartIconBtn) return;

  const count = getCartItemCount();
  const existingBadge = cartIconBtn.querySelector("span");

  if (count > 0) {
    if (existingBadge) {
      existingBadge.textContent = count.toString();
    } else {
      const badge = document.createElement("span");
      badge.className =
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
      badge.textContent = count.toString();
      cartIconBtn.appendChild(badge);
    }
  } else {
    if (existingBadge) {
      existingBadge.remove();
    }
  }
}
