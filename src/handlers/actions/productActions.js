import { addToCart } from "./cartActions.js";
import { navigateToProduct } from "./navigationActions.js";

/**
 * 상품 클릭 처리 (상세 페이지로 이동)
 * @param {HTMLElement} element - 클릭된 요소
 */
export function handleProductClick(element) {
  const productCard = element.closest(".product-card");
  if (!productCard) return;

  const productId = productCard.dataset.productId;
  if (productId) {
    navigateToProduct(productId);
  }
}

/**
 * 장바구니에 상품 추가 처리
 * @param {HTMLElement} button - 클릭된 버튼 요소
 */
export function handleAddToCartClick(button) {
  const productId = button.dataset.productId;
  const title = button.dataset.productTitle;
  const image = button.dataset.productImage;
  const lprice = button.dataset.productLprice;

  if (!productId || !title || !image || !lprice) return;

  addToCart(productId, { title, image, lprice }, 1);
}

/**
 * 상세 페이지에서 장바구니에 상품 추가 (수량 포함)
 * @param {HTMLElement} button - 클릭된 버튼 요소
 */
export function handleDetailPageAddToCart(button) {
  const productId = button.dataset.productId;
  const title = button.dataset.productTitle;
  const image = button.dataset.productImage;
  const lprice = button.dataset.productLprice;
  const quantityInput = document.querySelector("#quantity-input");
  const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

  if (!productId || !title || !image || !lprice) return;

  addToCart(productId, { title, image, lprice }, quantity);
}

/**
 * 수량 증가 처리
 */
export function handleQuantityIncrease() {
  const quantityInput = document.querySelector("#quantity-input");
  if (!quantityInput) return;

  const currentValue = Number(quantityInput.value);
  quantityInput.value = currentValue + 1;
}

/**
 * 수량 감소 처리
 */
export function handleQuantityDecrease() {
  const quantityInput = document.querySelector("#quantity-input");
  if (!quantityInput) return;

  const currentValue = Number(quantityInput.value);
  if (currentValue > 1) {
    quantityInput.value = currentValue - 1;
  }
}
