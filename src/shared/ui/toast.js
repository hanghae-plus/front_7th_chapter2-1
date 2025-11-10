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
  "flex",
  "items-center",
  "space-x-2",
  "max-w-sm",
  "transition-opacity",
  "duration-300",
].join(" ");

const TOAST_VARIANT_CLASS_MAP = {
  success: "bg-green-600",
  info: "bg-blue-600",
  error: "bg-red-600",
};

const TOAST_ICON_MAP = {
  success: `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
  `,
  info: `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  `,
  error: `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  `,
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
  const icon = TOAST_ICON_MAP[type] ?? TOAST_ICON_MAP.success;

  toast.className = `${TOAST_BASE_CLASSES} ${variantClass}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

  toast.innerHTML = `
    <div class="flex-shrink-0">
      ${icon}
    </div>
    <p class="text-sm font-medium">${escapeHtml(message)}</p>
    <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  // 닫기 버튼 이벤트 핸들러
  const closeButton = toast.querySelector("#toast-close-btn");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      toast.classList.add("opacity-0");
      window.setTimeout(() => {
        toast.remove();
        if (container && container.childElementCount === 0) {
          container.remove();
        }
      }, 300);
    });
  }

  // 자동 닫기
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

// HTML 이스케이프 함수
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
