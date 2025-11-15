import ToastAlert from "../components/ToastAlert";

/**
 * @param {string} message
 * @param {'success'|'info'|'error'} type
 * @param {Object} options
 * @param {number} [options.duration=3000]
 */
export const showToastMessage = (message, type, options = { duration: 3000 }) => {
  const { duration = 3000 } = options;
  const TOAST_ROOT_ID = "toast-root";

  /** @type {HTMLElement | null} */
  let $toastRoot = document.getElementById(TOAST_ROOT_ID);
  if (!$toastRoot) {
    $toastRoot = document.createElement("div");
    $toastRoot.id = TOAST_ROOT_ID;
    $toastRoot.className =
      "toast-alert fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 items-center justify-center mx-auto";
    $toastRoot.style.width = "fit-content";
    document.body.appendChild($toastRoot);
  }

  if (!$toastRoot) throw new Error("Toast root element not found");

  const toastId = `toast-${Date.now()}`;

  $toastRoot.insertAdjacentHTML("beforeend", ToastAlert({ message, type, id: toastId }));

  const toastAlert = document.querySelector(`[data-toast-id="${toastId}"]`);

  const timer = setTimeout(() => {
    toastAlert?.remove();
  }, duration);

  /**
   * @param {MouseEvent} event
   */
  toastAlert?.addEventListener("click", (event) => {
    if (!event.target) return;
    if (event.target.closest("#toast-close-btn")) {
      clearTimeout(timer);
      toastAlert?.remove();
    }
  });
};
