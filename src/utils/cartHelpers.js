import { addCartItem } from "./cartStorage.js";
import { toast } from "./toast.js";
import { TOAST_MESSAGES } from "../constants.js";

/**
 * HTML 요소에서 상품 데이터를 추출합니다.
 * @param {HTMLElement} element - dataset 속성을 가진 요소
 * @returns {Object|null} 상품 데이터 또는 null
 */
export const extractProductData = (element) => {
  if (!element || !element.dataset) {
    return null;
  }

  return {
    id: element.dataset.productId,
    title: element.dataset.title,
    price: Number(element.dataset.price),
    image: element.dataset.image,
  };
};

/**
 * 상품을 장바구니에 추가하고 사용자에게 피드백을 제공합니다.
 * @param {Object} productData - 상품 데이터
 * @param {number} quantity - 추가할 수량
 * @returns {boolean} 성공 여부
 */
export const addToCartWithFeedback = (productData, quantity) => {
  if (!productData || !productData.id || !productData.title || productData.price === undefined) {
    toast.error(TOAST_MESSAGES.PRODUCT_INFO_ERROR);
    return false;
  }

  const validQuantity = Math.max(1, parseInt(quantity) || 1);

  const product = {
    id: productData.id,
    title: productData.title,
    price: Number(productData.price),
    image: productData.image || "",
  };

  addCartItem(product, validQuantity);
  toast.success(TOAST_MESSAGES.CART_ADD_SUCCESS);

  // updateCartIconCount()는 자동으로 호출됨 (subscribeCartChange)

  return true;
};
