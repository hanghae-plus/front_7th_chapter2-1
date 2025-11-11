import { CartModal } from "../components/cart/CartModal";

class ModalStore {
  constructor() {
    this.modals = new Map();
    this.portal = null;
    this.currentOpenModal = null;
  }

  init() {
    if (!this.portal) {
      this.createPortal();
    }
    this.events();
  }

  register(name, modal) {
    this.modals.set(name, modal);
  }

  createPortal() {
    this.portal = document.createElement("div");
    this.portal.id = "modal-portal";
    this.portal.classList.add(
      "fixed",
      "inset-0",
      "z-50",
      "hidden",
      "flex",
      "items-center",
      "justify-center",
      "bg-black",
      "bg-opacity-50",
    );
    document.body.appendChild(this.portal);
  }

  open(name) {
    if (this.currentOpenModal === name) {
      return;
    }

    const modal = this.modals.get(name);

    if (!modal) {
      throw new Error("모달 없음");
    }

    this.currentOpenModal = modal;
    this.portal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    this.currentOpenModal.mount("#modal-portal");
  }

  close() {
    if (!this.currentOpenModal) {
      throw new Error("모달 없음");
    }

    this.portal.classList.add("hidden");
    document.body.style.overflow = "auto";
    this.portal.removeChild(this.portal.lastChild);
    this.currentOpenModal.unmount();

    this.currentOpenModal = null;
  }

  events() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("#cart-icon-btn")) {
        this.open("cart");
      }
    });

    this.portal.addEventListener("click", (event) => {
      if (event.target.closest("#cart-modal-close-btn")) {
        this.close();
      }

      if (event.target.id === "modal-portal") {
        this.close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.close();
      }
    });
  }

  getPortal() {
    return this.portal;
  }
}

export const modalStore = new ModalStore();

modalStore.register("cart", new CartModal());
