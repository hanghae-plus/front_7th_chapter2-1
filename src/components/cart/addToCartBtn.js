import { getCartData, saveCartData } from "./CartDialog.js";
import { showToast } from "../common/Toast.js";

// 장바구니 담기 버튼 컴포넌트
export const AddToCartBtn = (product, quantity, size = "default", id = null) => {
  const sizeClasses = {
    default: "py-3 px-4 font-medium",
    small: "text-sm py-2 px-3",
  };
  const buttonClass = sizeClasses[size] || sizeClasses.default;
  const idAttr = id ? `id="${id}"` : "";

  // product 정보를 JSON으로 인코딩하여 data 속성에 저장
  const productData = encodeURIComponent(JSON.stringify(product));

  return /*html*/ `
    <button ${idAttr} class="add-to-cart-btn w-full bg-blue-600 text-white ${buttonClass} rounded-md
         hover:bg-blue-700 transition-colors" data-product-id="${product.productId}" data-quantity="${quantity}" data-product="${productData}">
      장바구니 담기
    </button>
  `;
};

// 장바구니에 상품 추가 함수
const addToCart = (product, quantity) => {
  // 현재 장바구니 데이터 가져오기
  const cartData = getCartData();
  const { items } = cartData;

  // 같은 productId가 이미 있는지 확인 (id 필드로 확인)
  const existingItemIndex = items.findIndex((item) => item.id === product.productId);

  if (existingItemIndex !== -1) {
    // 이미 있는 상품이면 수량만 증가
    items[existingItemIndex].quantity += quantity;
  } else {
    // 새로운 상품이면 필요한 필드만 추출하여 추가
    const cartItem = {
      id: product.productId,
      image: product.image,
      price: product.lprice || product.price || 0,
      quantity,
      title: product.title,
      selected: false,
    };
    items.push(cartItem);
  }

  // 장바구니 데이터 저장
  saveCartData(cartData);

  // Toast 메시지 표시
  showToast("장바구니에 추가되었습니다", "success");

  // 장바구니 컨텐츠 업데이트 (window.updateCartContent가 있으면 호출)
  if (window.updateCartContent) {
    window.updateCartContent();
  }
};

// 장바구니 담기 버튼 이벤트 리스너 등록
export const initAddToCartButtons = () => {
  // 이벤트 위임을 사용하여 동적으로 추가되는 버튼에도 이벤트 적용
  document.addEventListener("click", (e) => {
    const button = e.target.closest(".add-to-cart-btn");
    if (!button) return;

    const productId = button.getAttribute("data-product-id");
    const quantity = parseInt(button.getAttribute("data-quantity")) || 1;
    const productData = button.getAttribute("data-product");

    if (productId && productData) {
      try {
        const product = JSON.parse(decodeURIComponent(productData));
        addToCart(product, quantity);
      } catch (error) {
        console.error("상품 정보를 파싱하는 중 오류가 발생했습니다:", error);
      }
    }
  });
};
