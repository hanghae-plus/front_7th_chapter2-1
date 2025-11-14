export function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast-notification fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50";

  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";
  const icon =
    type === "success"
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
      : type === "error"
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';

  toast.innerHTML = `
    <div class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icon}</svg>
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  const closeBtn = toast.querySelector(".toast-close-btn");
  closeBtn?.addEventListener("click", () => toast.remove());

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3000);
}
