import { getProduct } from "../api/productApi";
import { ADD_CART_LIST, getLocalStorage, setLocalStorage } from "./localstorage";

// 장바구니 개수만 업데이트하는 함수
export const updateCartCount = () => {
  const cartData = getLocalStorage(ADD_CART_LIST).items;
  const count = cartData.length;
  const cartIconBtn = document.querySelector("#cart-icon-btn");

  if (!cartIconBtn) return;

  // 기존 span 찾기
  let cartCountElement = document.querySelector("#cart-count");

  if (count === 0) {
    // 개수가 0이면 span 제거
    if (cartCountElement) {
      cartCountElement.remove();
    }
  } else {
    // 개수가 1 이상이면
    if (cartCountElement) {
      // span이 있으면 숫자만 업데이트
      cartCountElement.textContent = count;
    } else {
      // span이 없으면 새로 생성 (처음 추가할 때)
      const newSpan = document.createElement("span");
      newSpan.id = "cart-count";
      newSpan.className =
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
      newSpan.textContent = count;
      cartIconBtn.appendChild(newSpan);
    }
  }
};

export const storedData = async ({ id, datailPageQuantity = 0 }) => {
  let storedData = getLocalStorage(ADD_CART_LIST);

  if (!storedData || !storedData.items) {
    storedData = { items: [], selectedAll: false };
  }

  const addToCartTarget = await getProduct(id);

  const targetProductId = addToCartTarget.productId;
  const targetIndex = storedData.items.findIndex((item) => item.id === targetProductId);

  if (targetIndex !== -1) {
    const updatedItems = [...storedData.items];

    updatedItems[targetIndex] = {
      ...updatedItems[targetIndex],
      quantity: updatedItems[targetIndex].quantity + 1 + Number(datailPageQuantity),
    };

    setLocalStorage(ADD_CART_LIST, { ...storedData, items: updatedItems });
  } else {
    const storeTargetData = {
      id: targetProductId,
      image: addToCartTarget.image,
      price: addToCartTarget.lprice,
      quantity: datailPageQuantity || 1,
      selected: false,
      title: addToCartTarget.title,
    };

    setLocalStorage(ADD_CART_LIST, { ...storedData, items: [...storedData.items, storeTargetData] });
  }
  updateCartCount();
};
