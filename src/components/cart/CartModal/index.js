import { CartModalAction } from "./CartModalAction/CartModalAction";
import { CartModalHeader } from "./CartModalHeader/CartModalHeader";
import { CartModalContent } from "./CartModalContent/CartModalContent";

export const CartModal = ({ items = [] } = {}) => {
  return /*HTML*/ `
    <div class="fixed inset-0 z-50 overflow-y-auto cart-modal">
      <!-- 배경 오버레이 -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
      <!-- 모달 컨테이너 -->
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          <div data-cart-modal-header>
            ${CartModalHeader({ count: items.length })}
          </div>
          <!-- 컨텐츠 -->
          <div class="flex flex-col max-h-[calc(90vh-120px)]" data-cart-modal-content>
            ${CartModalContent({ items })}
            ${items.length > 0 ? CartModalAction({ items }) : ""}
          </div>
        </div>
      </div>
    </div>
  `;
};
