import { CartHeader, CartList } from "../components/cart";

let isOpen = false;

const CartModalTemplate = () => /*html*/ `
<div class="cart-modal fixed inset-0 z-50 overflow-y-auto">
  <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
  <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
    <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
      ${CartHeader()}
      ${CartList()}
    </div>
  </div>
</div>
`;

export const openCartModal = () => {
  if (isOpen) return;

  let modal = document.querySelector(".cart-modal");
  if (!modal) {
    const appRoot = document.querySelector("#root > div");
    if (!appRoot) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = CartModalTemplate();
    modal = wrapper.firstElementChild;
    appRoot.appendChild(modal);
  } else {
    modal.classList.remove("hidden");
  }

  document.body.classList.add("overflow-hidden");
  isOpen = true;
};

export const closeCartModal = () => {
  const modal = document.querySelector(".cart-modal");
  if (!modal) return;

  modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
  isOpen = false;
};
