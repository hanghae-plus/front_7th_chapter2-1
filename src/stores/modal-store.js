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

  register(name, ModalClass) {
    this.modals.set(name, ModalClass);
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

    // 테스트 통과 위해서 #root에 렌더
    document.querySelector("#root").appendChild(this.portal);
    // document.body.appendChild(this.portal);
  }

  open(name) {
    if (this.currentOpenModal?.name === name) return;

    const ModalClass = this.modals.get(name);
    if (!ModalClass) throw new Error(`"모달이 등록되어 있지 않습니다.`);

    // 모달 인스턴스 생성
    const modalInstance = new ModalClass(this.portal);

    this.currentOpenModal = { name, instance: modalInstance };
    this.portal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    modalInstance.mount("#modal-portal");
  }

  close() {
    if (!this.currentOpenModal) return;

    const { instance } = this.currentOpenModal;
    this.portal.classList.add("hidden");
    document.body.style.overflow = "auto";
    instance.unmount?.();
    this.portal.innerHTML = "";
    this.currentOpenModal = null;
  }

  events() {
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
