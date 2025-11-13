const getCartModal = () => document.querySelector("#cart-modal");

const showCartModal = () => {
  const cartModal = getCartModal();
  if (!cartModal) {
    return;
  }

  if (cartModal.classList.contains("hidden")) {
    cartModal.classList.remove("hidden");
    cartModal.setAttribute("aria-hidden", "false");
  }
};

const hideCartModal = () => {
  const cartModal = getCartModal();
  if (!cartModal) {
    return;
  }

  if (!cartModal.classList.contains("hidden")) {
    cartModal.classList.add("hidden");
    cartModal.setAttribute("aria-hidden", "true");
  }
};

const toggleCartModal = () => {
  const cartModal = getCartModal();
  if (!cartModal) {
    return;
  }

  const isHidden = cartModal.classList.toggle("hidden");
  cartModal.setAttribute("aria-hidden", isHidden ? "true" : "false");
};

const handleUIClick = (event) => {
  const cartIconButton = event.target.closest("#cart-icon-btn");
  if (cartIconButton) {
    toggleCartModal();
    return;
  }

  const cartModalCloseButton = event.target.closest("#cart-modal-close-btn");
  if (cartModalCloseButton) {
    toggleCartModal();
  }
};

export const registerUIEvents = () => {
  document.body.addEventListener("click", handleUIClick);
};

export { showCartModal, hideCartModal };
