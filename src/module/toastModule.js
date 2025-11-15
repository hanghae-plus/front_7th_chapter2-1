import Toast from "../component/Toast.js";

const toastModule = (root) => {
  let timer;

  const showToast = ({ message, type }) => {
    if (timer) {
      clearTimeout(timer);
    }

    // 기존 토스트 제거
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    // 즉시 새 토스트 추가 (동기적 실행)
    root.insertAdjacentHTML("beforeend", Toast({ type, message }));

    const removeToast = () => {
      document.querySelector(".toast")?.remove();
    };

    // 렌더링 확인을 위한 즉시 실행
    const toastElement = document.querySelector(".toast");
    if (toastElement) {
      // 강제 reflow로 렌더링 보장
      void toastElement.offsetHeight;
    }

    const closeBtn = document.querySelector("#toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", removeToast);
    }
    timer = setTimeout(removeToast, 3000);
  };

  return { showToast };
};

export default toastModule;
