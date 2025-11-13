import { Component } from "@/core/Component";
import { Router } from "@/core/Router.js";
import CartModal from "@/components/common/CartModal";

const ProductCard = Component({
  template: (context) => {
    const { title, image, lprice, productId, brand, maker } = context.props.product;

    return /* HTML */ `
      <!-- 상품 이미지 -->
      <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img
          src="${image}"
          alt="${title}"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>
      <!-- 상품 정보 -->
      <div class="p-3">
        <div class="cursor-pointer product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">${title}</h3>
          <p class="text-xs text-gray-500 mb-2">${brand || maker}</p>
          <p class="text-lg font-bold text-gray-900">${Number(lprice).toLocaleString()}원</p>
        </div>
        <!-- 장바구니 버튼 -->
        <button
          class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
                hover:bg-blue-700 transition-colors add-to-cart-btn"
          data-product-id="${productId}"
        >
          장바구니 담기
        </button>
      </div>
    `;
  },
  setEvent: ({ addEvent, props }) => {
    const router = Router();
    const { title, image, lprice, productId } = props.product;

    // 상품 이미지 클릭 - 상세 페이지 이동
    addEvent(".product-image", "click", () => {
      router.push(`/product/${productId}`);
    });

    // 상품 정보 클릭 - 상세 페이지 이동
    addEvent(".product-info", "click", () => {
      router.push(`/product/${productId}`);
    });

    // 장바구니 담기 버튼 클릭
    addEvent(".add-to-cart-btn", "click", (e) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      CartModal.addItem({
        productId,
        title,
        image,
        price: Number(lprice),
      });
    });
  },
});

export default ProductCard;
