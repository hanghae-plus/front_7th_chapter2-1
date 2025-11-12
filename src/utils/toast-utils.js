import ToastAlert from "../components/ToastAlert";

/**
 * @param {string} message
 * @param {'success'|'info'|'error'} type
 */
export const showToastMessage = (message, type) => {
  document.body.innerHTML += ToastAlert({ message, type });

  const toastAlert = document.querySelector(".toast-alert");
  if (!toastAlert) return;
  setTimeout(() => {
    toastAlert.remove();
  }, 3000);
};
