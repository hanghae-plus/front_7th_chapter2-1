import Toast from "../component/Toast.js";

const toastModule = (root) => {
  let timer;

  const showToast = ({ message, type }) => {
    if (timer) {
      clearTimeout(timer);
    }

    // 기존 토스트 제거
    document.querySelector(".toast")?.remove();
    root.insertAdjacentHTML("beforeend", Toast({ type, message }));

    const removeToast = () => {
      document.querySelector(".toast")?.remove();
    };

    // CI 환경에서 토스트가 확실히 렌더링되도록 처리
    requestAnimationFrame(() => {
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
    });
  };

  return { showToast };
};

export default toastModule;
