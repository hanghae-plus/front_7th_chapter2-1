const TOAST_CONTAINER_ID = "toast-container";
const TOAST_DISPLAY_DURATION = 3000;
const TOAST_CONTAINER_CLASSES = [
  "fixed",
  "top-20",
  "left-1/2",
  "-translate-x-1/2",
  "z-50",
  "flex",
  "flex-col",
  "items-center",
  "space-y-2",
].join(" ");

const TOAST_BASE_CLASSES = [
  "toast-item",
  "text-white",
  "px-4",
  "py-3",
  "rounded-lg",
  "shadow-lg",
  "text-sm",
  "font-medium",
  "transition-opacity",
  "duration-300",
].join(" ");

const TOAST_VARIANT_CLASS_MAP = {
  success: "bg-green-600",
  info: "bg-blue-600",
  error: "bg-red-600",
};

export const showToast = (message, type = "success") => {
  if (typeof document === "undefined") {
    return;
  }

  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_CONTAINER_ID;
    container.className = TOAST_CONTAINER_CLASSES;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const variantClass = TOAST_VARIANT_CLASS_MAP[type] ?? TOAST_VARIANT_CLASS_MAP.success;
  toast.className = `${TOAST_BASE_CLASSES} ${variantClass}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("opacity-0");
    window.setTimeout(() => {
      toast.remove();
      if (container && container.childElementCount === 0) {
        container.remove();
      }
    }, 300);
  }, TOAST_DISPLAY_DURATION);
};
