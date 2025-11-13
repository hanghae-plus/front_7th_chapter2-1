import { renderToastContent } from "../components/Toast.js";

const getCartModal = () => document.querySelector("#cart-modal");
const getToastContainer = () => document.querySelector("#toast-container");

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
    hideCartModal();
    return;
  }

  // 모달 배경 클릭 시 닫기
  const cartModal = event.target.closest("#cart-modal");
  if (cartModal && event.target === cartModal) {
    hideCartModal();
    return;
  }

  // Toast 닫기 버튼 클릭
  const toastCloseButton = event.target.closest("#toast-close-btn");
  if (toastCloseButton) {
    hideToast();
    return;
  }
};

const handleUIKeydown = (event) => {
  // ESC 키로 모달 닫기
  if (event.key === "Escape" || event.key === "Esc") {
    const cartModal = getCartModal();
    if (cartModal && !cartModal.classList.contains("hidden")) {
      hideCartModal();
    }
  }
};

let toastTimeout = null;

const showToast = (type = "success", message = "") => {
  // 즉시 실행 (Toast는 PageLayout에 항상 있음)
  let toastContainer = getToastContainer();

  if (!toastContainer) {
    // Toast 컨테이너가 없으면 재시도 (라우터 렌더링 중일 수 있음)
    requestAnimationFrame(() => {
      toastContainer = getToastContainer();
      if (!toastContainer) {
        // 한 번 더 재시도
        setTimeout(() => {
          toastContainer = getToastContainer();
          if (!toastContainer) {
            console.error("Toast container not found in DOM");
            return;
          }
          displayToast(toastContainer, type, message);
        }, 100);
        return;
      }
      displayToast(toastContainer, type, message);
    });
    return;
  }

  displayToast(toastContainer, type, message);
};

const displayToast = (toastContainer, type = "success", message = "") => {
  if (!toastContainer) {
    return;
  }

  // 기존 타이머가 있으면 취소
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  // Toast 내용 업데이트
  const toastContent = toastContainer.querySelector("#toast-content");
  if (toastContent) {
    toastContent.innerHTML = renderToastContent(type, message);

    // Toast 표시 - hidden 클래스 제거
    toastContainer.classList.remove("hidden");

    // 3초 후 자동으로 숨김
    toastTimeout = setTimeout(() => {
      hideToast();
    }, 3000);
  } else {
    // Toast 내용이 없으면 기본적으로 표시만
    toastContainer.classList.remove("hidden");
    toastTimeout = setTimeout(() => {
      hideToast();
    }, 3000);
  }
};

const hideToast = () => {
  const toastContainer = getToastContainer();
  if (!toastContainer) {
    return;
  }

  // 타이머 취소
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  // Toast 숨김 - hidden 클래스 추가
  toastContainer.classList.add("hidden");
};

export const registerUIEvents = () => {
  document.body.addEventListener("click", handleUIClick);
  document.addEventListener("keydown", handleUIKeydown);
};

export { showCartModal, hideCartModal, showToast, hideToast };
