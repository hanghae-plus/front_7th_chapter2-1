const containerId = "global-toast-container";

export function showToast(message, type = "success") {
  ensureContainer();
  const container = document.getElementById(containerId);
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = getToastClass(type);
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" class="ml-3 text-sm underline">닫기</button>
  `;

  const closeButton = toast.querySelector("button");
  if (closeButton) {
    closeButton.addEventListener("click", () => dismissToast(toast));
  }

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("opacity-100", "translate-y-0"));

  setTimeout(() => dismissToast(toast), 3000);
}

function ensureContainer() {
  if (document.getElementById(containerId)) return;
  const container = document.createElement("div");
  container.id = containerId;
  container.className = "fixed top-4 right-4 flex flex-col gap-2 z-[9999] max-w-sm pointer-events-none";
  document.body.appendChild(container);
}

function dismissToast(node) {
  if (!node) return;
  node.classList.remove("opacity-100", "translate-y-0");
  node.classList.add("opacity-0", "-translate-y-2");
  setTimeout(() => {
    node.remove();
    const container = document.getElementById(containerId);
    if (container && container.childElementCount === 0) {
      container.remove();
    }
  }, 200);
}

function getToastClass(type) {
  const base =
    "pointer-events-auto transition transform translate-y-2 opacity-0 rounded-md shadow-lg px-4 py-3 text-sm flex items-center justify-between";
  switch (type) {
    case "info":
      return `${base} bg-blue-600 text-white`;
    case "error":
      return `${base} bg-red-600 text-white`;
    default:
      return `${base} bg-green-600 text-white`;
  }
}
