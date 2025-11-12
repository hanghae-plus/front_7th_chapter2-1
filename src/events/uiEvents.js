const toggleCartModalVisibility = () => {
  const cartModal = document.querySelector("#cart-modal");
  if (!cartModal) {
    return;
  }

  const isHidden = cartModal.classList.toggle("hidden");
  cartModal.setAttribute("aria-hidden", isHidden ? "true" : "false");
};

const handleUIClick = (event) => {
  const cartIconButton = event.target.closest("#cart-icon-btn");
  if (cartIconButton) {
    toggleCartModalVisibility();
    return;
  }

  const cartModalCloseButton = event.target.closest("#cart-modal-close-btn");
  if (cartModalCloseButton) {
    toggleCartModalVisibility();
  }
};

export const registerUIEvents = () => {
  document.body.addEventListener("click", handleUIClick);
};
