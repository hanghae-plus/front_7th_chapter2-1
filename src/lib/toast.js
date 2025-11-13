const TOAST_VARIANTS = {
  success: {
    containerClass: "bg-green-600 text-white",
    iconPath: "M5 13l4 4L19 7",
  },
  info: {
    containerClass: "bg-blue-600 text-white",
    iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    containerClass: "bg-red-600 text-white",
    iconPath: "M6 18L18 6M6 6l12 12",
  },
};

const DEFAULT_DURATION = 3000;

const ensureContainer = () => {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed inset-x-0 bottom-16 z-50 flex flex-col items-center gap-2 px-4";
    document.body.appendChild(container);
  }
  return container;
};

const removeToast = (toastElement) => {
  if (!toastElement) return;
  toastElement.classList.add("opacity-0", "translate-y-2");
  window.setTimeout(() => {
    toastElement.remove();
  }, 200);
};

export const showToast = ({ type = "info", message = "", duration = DEFAULT_DURATION } = {}) => {
  if (typeof document === "undefined") return;
  const variant = TOAST_VARIANTS[type] ?? TOAST_VARIANTS.info;
  const container = ensureContainer();

  const toastElement = document.createElement("div");
  toastElement.className = `w-full max-w-sm rounded-lg shadow-lg flex items-center space-x-2 px-4 py-3 ${variant.containerClass}`;

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "flex-shrink-0";
  iconWrapper.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${variant.iconPath}"></path>
    </svg>
  `;

  const messageWrapper = document.createElement("p");
  messageWrapper.className = "text-sm font-medium flex-1";
  messageWrapper.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.id = "toast-close-btn";
  closeButton.className = "flex-shrink-0 ml-2 text-white hover:text-gray-200 transition";
  closeButton.setAttribute("type", "button");
  closeButton.setAttribute("aria-label", "토스트 닫기");
  closeButton.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  `;

  toastElement.appendChild(iconWrapper);
  toastElement.appendChild(messageWrapper);
  toastElement.appendChild(closeButton);

  container.appendChild(toastElement);

  toastElement.classList.add("opacity-0", "translate-y-2");
  window.requestAnimationFrame(() => {
    toastElement.classList.remove("opacity-0", "translate-y-2");
  });

  const timeoutId = window.setTimeout(() => removeToast(toastElement), duration);

  closeButton.addEventListener("click", () => {
    window.clearTimeout(timeoutId);
    removeToast(toastElement);
  });
};
