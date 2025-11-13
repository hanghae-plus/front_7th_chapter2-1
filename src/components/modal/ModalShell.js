import { ModalHeader } from "./ModalHeader.js";
import { EmptyCart } from "./EmptyCart.js";
import { CartContent } from "./CartContent.js";

const buildCartList = (productList) => {
  if (!Array.isArray(productList) || productList.length === 0) {
    return EmptyCart();
  }

  return CartContent(productList);
};

export const ModalShell = (state = {}) => {
  const productList = Array.isArray(state.productList) ? state.productList : [];

  return /*html*/ `
    <div class="hidden fixed inset-0 z-50 overflow-y-auto cart-modal">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          <!-- 헤더 -->
          ${ModalHeader(productList.length)}

          <!-- 컨텐츠 -->
          ${buildCartList(productList)}
        </div>        
      </div>
    </div>
  `;
};
