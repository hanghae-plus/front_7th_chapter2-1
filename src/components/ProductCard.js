// @ts-check

import { formatNumber } from "../utils/formatter.js";
import createComponent from "../core/component/create-component.js";
import Router from "../core/router/index.js";
import appStore from "../store/app-store.js";
import { showToastMessage } from "../utils/toast-utils.js";
import { TOAST_MESSAGE_MAP } from "../constants/toast-constant.js";
const ProductCard = createComponent({
  id: "product-card",
  props: {
    productId: "",
    image: "",
    title: "",
    brand: "",
    lprice: 0,
  },
  eventHandlers: {
    "navigate-to-detail": (props, getter, setter, event) => {
      if (!event.target) return;
      Router.push(`/product/${props.productId}`);
    },
    "add-to-cart": (props, getter, setter, event) => {
      if (!event.target) return;
      const productId = event.target.dataset.productId;
      if (!productId) return;
      appStore.addToCart({
        id: productId,
        title: props.title,
        image: props.image,
        price: props.lprice,
        selected: false,
      });
      showToastMessage(TOAST_MESSAGE_MAP.ADD_TO_CART, "success");
    },
  },
  templateFn: ({ productId, image, title, brand, lprice }) => {
    return /* HTML */ `
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
        data-product-id="${productId}"
        data-link
        data-event="navigate-to-detail"
        data-event-type="click"
      >
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
            <p class="text-xs text-gray-500 mb-2">${brand}</p>
            <p class="text-lg font-bold text-gray-900">${formatNumber(lprice)}원</p>
          </div>
          <!-- 장바구니 버튼 -->
          <button
            class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
              hover:bg-blue-700 transition-colors add-to-cart-btn"
            data-product-id="${productId}"
            id="add-to-cart-btn"
            data-event="add-to-cart"
            data-event-type="click"
          >
            장바구니 담기
          </button>
        </div>
      </div>
    `;
  },
});

export default ProductCard;
