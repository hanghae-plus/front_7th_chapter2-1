import { dismissToast, subscribeToast } from "@/store/toast.js";

const TYPE_CONFIG = {
  success: {
    tone: "bg-green-600 text-white",
    icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `,
  },
  info: {
    tone: "bg-blue-600 text-white",
    icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01m8 8a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    `,
  },
  error: {
    tone: "bg-red-600 text-white",
    icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `,
  },
  warning: {
    tone: "bg-amber-500 text-white",
    icon: `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.29 3.86l-7.4 12.8A1 1 0 003.71 18h14.58a1 1 0 00.86-1.54l-7.4-12.8a1 1 0 00-1.72 0zM12 9v4m0 4h.01"
        />
      </svg>
    `,
  },
};

const CLOSE_ICON_BUTTON = `<button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
</button>`;

function ToastManager() {
  const containerId = "toast-root";
  let unsubscribe = null;

  function ensureContainer() {
    const container = document.getElementById(containerId);
    if (container) return container;
    const wrapper = document.createElement("div");
    wrapper.className = ["fixed bottom-10 right-[50%] translate-x-[50%]", "z-[100]"].join(" ");
    wrapper.id = containerId;

    document.getElementById("root").appendChild(wrapper);
    return wrapper;
  }

  function render(toasts) {
    const container = ensureContainer();

    container.innerHTML = toasts
      .map(({ type, message, id }) => {
        const { tone, icon } = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
        return html`<div id="${id}" class="px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm ${tone}">
          <div class="flex-shrink-0">${icon}</div>
          <p class="text-sm font-medium">${message}</p>
          ${CLOSE_ICON_BUTTON}
        </div> `;
      })
      .join("");
  }

  function handleContainerEvents(container) {
    container.addEventListener("click", (event) => {
      const dismissBtn = event.target.closest("#toast-close-btn");
      dismissToast(dismissBtn.parentNode.id);
    });
  }

  function mount() {
    const container = ensureContainer();
    handleContainerEvents(container);

    if (!unsubscribe) {
      unsubscribe = subscribeToast(render);
    }
  }

  function unmount() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    const container = document.getElementById(containerId);
    if (container) container.remove();
  }

  return { mount, unmount };
}

export const toastCore = ToastManager();
