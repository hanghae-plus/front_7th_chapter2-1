import { CartToast } from "../components/CartToast.js";

const DEFAULT_TIMEOUT = 2500;
export class ToastManager {
  static show({ type = "info", duration = DEFAULT_TIMEOUT, message = "" }) {
    // 기존 토스트가 있다면 제거
    const existingToast = document.querySelector(".toast-container");
    if (existingToast) {
      existingToast.remove();
    }

    // 토스트 컨테이너 생성
    const toastContainer = document.createElement("div");
    toastContainer.className = "toast-container fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50";

    // CartToast 컴포넌트 사용
    toastContainer.innerHTML = CartToast({ type, message });

    // 문서에 추가
    document.body.appendChild(toastContainer);

    // 닫기 버튼 이벤트
    const closeBtn = toastContainer.querySelector("#toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hide(toastContainer);
      });
    }

    // 자동 숨김
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toastContainer);
      }, duration);
    }

    return toastContainer;
  }

  static hide(toastContainer) {
    if (toastContainer && toastContainer.parentNode) {
      toastContainer.remove();
    }
  }
}
