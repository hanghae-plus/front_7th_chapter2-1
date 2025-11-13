import Toast from "../component/Toast.js";

const toastModule = (root) => {
  let timer;

  const showToast = ({ message, type }) => {
    if (timer) {
      clearTimeout(timer);
    }

    root.insertAdjacentHTML("beforeend", Toast({ type, message }));

    const removeToast = () => {
      document.querySelector(".toast")?.remove();
    };

    document.querySelector("#toast-close-btn").addEventListener("click", removeToast);
    timer = setTimeout(removeToast, 3000);
  };

  return { showToast };
};

export default toastModule;
