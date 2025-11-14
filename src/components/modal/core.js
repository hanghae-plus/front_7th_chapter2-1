// src/modal/modalManager.js
import { ModalLayout } from "@/components/modal/Layout.js";
import { toast } from "../../store/toast";
import { CartFooter } from "./Footer";

let currentModal = null;
export let carts = [];
export let selectedItems = new Set();

export function closeModalOnEscape(event) {
  if (event.key !== "Escape") return;
  closeModal();
}

export function addToCart(product) {
  const shoppingCart = localStorage.getItem("shopping_cart");
  if (shoppingCart) {
    carts = JSON.parse(shoppingCart);
  }

  const alreadyInCart = carts.find((cart) => cart.productId === product.productId);
  if (alreadyInCart) {
    if (product.quantity > 1) {
      alreadyInCart.quantity = alreadyInCart.quantity + product.quantity;
    } else {
      alreadyInCart.quantity++;
    }
  } else {
    carts.push({ ...product, quantity: 1 });
    const children = document.querySelector("#cart-icon-btn").children;
    if (children.length > 1) {
      children[1].innerHTML = carts.length;
    } else {
      const span = document.createElement("span");
      span.className =
        "absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
      span.innerHTML = carts.length;
      document.querySelector("#cart-icon-btn").appendChild(span);
    }
  }

  localStorage.setItem("shopping_cart", JSON.stringify(carts));
}

export function openModal(product) {
  if (currentModal) {
    closeModal(); // 이미 모달 할당되있으면 닫고 다시 열기
  }

  if (product) {
    addToCart(product);
  }

  currentModal = document.createElement("div");
  currentModal.className = "fixed inset-0 z-50 overflow-y-auto cart-modal";
  currentModal.innerHTML = ModalLayout();
  console.log(currentModal);
  const AllCheckbox = currentModal.querySelector("#cart-modal-select-all-checkbox");
  if (AllCheckbox) {
    AllCheckbox.checked = false;
  }

  const checkboxes = currentModal.querySelectorAll(".cart-item-checkbox");
  if (checkboxes) {
    currentModal.querySelectorAll(".cart-item-checkbox").forEach((checkbox) => {
      checkbox.checked = false;
    });
  }
  currentModal.addEventListener("click", handelClick);
  document.querySelector("#root").appendChild(currentModal);
  document.addEventListener("keydown", closeModalOnEscape);

  defaultModalEvents();
}

export function handelClick(event) {
  const { productId } = event.target.dataset;

  if (event.target.closest("#cart-modal-close-btn")) {
    closeModal();
    return;
  }

  if (event.target.closest("#cart-modal-remove-selected-btn")) {
    carts = carts.filter((cart) => !selectedItems.has(cart.productId));
    selectedItems.clear();
    currentModal.innerHTML = ModalLayout();
    currentModal.querySelector("#cart-modal-select-all-checkbox").checked = false;
    currentModal.querySelectorAll(".cart-item-checkbox").forEach((checkbox) => {
      checkbox.checked = false;
    });
    toast.info("선택된 상품들이 삭제되었습니다", { id: "toast-remove-selected" });
    localStorage.setItem("shopping_cart", JSON.stringify(carts));
    return;
  }

  if (event.target.closest("#cart-modal-select-all-checkbox")) {
    const checkbox = event.target.closest("#cart-modal-select-all-checkbox");
    const checked = checkbox.checked;

    selectedItems.clear();
    if (checked) {
      carts.map((cart) => selectedItems.add(cart.productId));
    }

    currentModal.querySelectorAll(".cart-item-checkbox").forEach((checkbox) => {
      checkbox.checked = checked;
    });

    currentModal.querySelector("#cart-modal-footer").innerHTML = CartFooter();
    return;
  }

  if (event.target.closest(".cart-item-checkbox")) {
    const checkbox = event.target.closest(".cart-item-checkbox");
    const { productId: id } = checkbox.dataset;
    if (!id) return;

    if (selectedItems.has(id)) {
      selectedItems.delete(id);
    } else {
      selectedItems.add(id);
    }

    checkbox.checked = selectedItems.has(id);

    currentModal?.querySelectorAll(".cart-item-checkbox").forEach((input) => {
      const { productId: inputId } = input.dataset;
      if (!inputId) return;
      input.checked = selectedItems.has(inputId);
    });

    currentModal.querySelector("#cart-modal-footer").innerHTML = CartFooter();
    return;
  }

  if (event.target.matches(".cart-item-remove-btn")) {
    carts = carts.filter((cart) => cart.productId !== productId);
    selectedItems.delete(productId);
    toast.info("선택된 상품이 삭제되었습니다", { id: "toast-remove-selected" });
    localStorage.setItem("shopping_cart", JSON.stringify(carts));
  }

  if (event.target.closest(".quantity-decrease-btn")) {
    const id = event.target.closest(".quantity-decrease-btn").dataset.productId;
    const target = carts.find((cart) => cart.productId === id);

    if (target.quantity > 1) {
      target.quantity--;
    } else {
      target.quantity = 1;
    }
  }

  if (event.target.closest(".quantity-increase-btn")) {
    const id = event.target.closest(".quantity-increase-btn").dataset.productId;
    carts.find((cart) => cart.productId === id).quantity++;
  }

  if (event.target.closest("#cart-modal-clear-cart-btn")) {
    carts = [];
    selectedItems.clear();
    toast.info("장바구니가 비워졌습니다", { id: "toast-clear-cart" });
    localStorage.removeItem("shopping_cart");
  }

  if (carts.length === 0) {
    const count = document.querySelector("#cart-icon-btn");
    count.removeChild(count.lastChild);
  }

  if (!currentModal) return;
  currentModal.innerHTML = ModalLayout();
}

export function defaultModalEvents() {
  currentModal?.querySelector("#cart-modal-close-btn")?.addEventListener("click", closeModal);

  currentModal?.querySelector(".cart-modal-overlay")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeModal();
  });
}

export function closeModal() {
  document.removeEventListener("keydown", closeModalOnEscape);
  if (!currentModal) return;
  currentModal.remove();
  currentModal = null;
}
