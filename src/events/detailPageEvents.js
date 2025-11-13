import { appendCartProduct } from "../store/appStore.js";

const handleQuantityChange = (event) => {
  const quantityInput = document.querySelector("#quantity-input");
  if (!quantityInput) {
    return;
  }

  const button = event.target.closest("#quantity-increase, #quantity-decrease");
  if (!button) {
    return;
  }

  event.preventDefault();

  const currentValue = Number(quantityInput.value) || 1;
  const min = Number(quantityInput.min) || 1;
  const max = Number(quantityInput.max) || 999;
  let newValue = currentValue;

  if (button.id === "quantity-increase") {
    // 증가 버튼
    newValue = Math.min(currentValue + 1, max);
  } else if (button.id === "quantity-decrease") {
    // 감소 버튼
    newValue = Math.max(currentValue - 1, min);
  }

  quantityInput.value = String(newValue);
};

const handleDetailPageClick = (event) => {
  // 수량 버튼 클릭 처리
  const quantityButton = event.target.closest("#quantity-increase, #quantity-decrease");
  if (quantityButton) {
    handleQuantityChange(event);
    return;
  }

  // DetailPage 장바구니 담기 버튼
  const addToCartButton = event.target.closest("#add-to-cart-btn");
  if (addToCartButton) {
    const productId = addToCartButton.dataset.productId;
    if (!productId) {
      return;
    }

    // 상품 상세 정보에서 데이터 추출
    const productImage = document.querySelector(".product-detail-image");
    const productTitle = document.querySelector("h1");
    const productPrice = document.querySelector(".text-2xl.font-bold.text-blue-600");
    const quantityInput = document.querySelector("#quantity-input");

    const title = productTitle?.textContent?.trim() ?? "";
    const priceText = productPrice?.textContent ?? "";
    const price = Number(priceText.replace(/[^\d]/g, "")) || 0;
    const image = productImage?.getAttribute("src") ?? "";
    const quantity = Number(quantityInput?.value ?? 1);

    // 수량을 한 번에 반영하여 장바구니에 추가 (localStorage에 자동 저장됨)
    appendCartProduct({
      id: productId,
      title,
      price,
      image,
      quantity,
    });

    // DetailPage에서는 모달을 띄우지 않음
    return;
  }
};

export const registerDetailPageEvents = () => {
  document.body.addEventListener("click", handleDetailPageClick);
};
