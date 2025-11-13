// 토스트 타입별 템플릿
const TOAST_TYPES = {
  success: {
    bgColor: "bg-green-600",
    icon: /*html*/ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    `,
  },
  info: {
    bgColor: "bg-blue-600",
    icon: /*html*/ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `,
  },
  error: {
    bgColor: "bg-red-600",
    icon: /*html*/ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    `,
  },
};

// 토스트 컨테이너 생성
function getOrCreateToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center";
    container.style.width = "fit-content";
    document.body.appendChild(container);
  }
  return container;
}

// 토스트 표시
export function showToast(message, type = "success", duration = 3000) {
  const container = getOrCreateToastContainer();
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.success;
  const toastId = `toast-${Date.now()}`;

  const toastHTML = /*html*/ `
    <div id="${toastId}" class="${toastConfig.bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm animate-slide-down">
      <div class="flex-shrink-0">
        ${toastConfig.icon}
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button class="flex-shrink-0 ml-2 text-white hover:text-gray-200" id="toast-close-btn" data-toast-id="${toastId}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", toastHTML);
  const toastElement = document.getElementById(toastId);

  // 닫기 버튼 이벤트
  const closeBtn = toastElement.querySelector("#toast-close-btn");
  closeBtn.addEventListener("click", () => removeToast(toastId));

  // 자동 제거
  if (duration > 0) {
    setTimeout(() => removeToast(toastId), duration);
  }

  return toastId;
}

// 토스트 제거
function removeToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.classList.add("animate-fade-out");
    setTimeout(() => {
      toast.remove();
      // 컨테이너가 비어있으면 제거
      const container = document.getElementById("toast-container");
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }
}

// 모든 토스트 제거
export function clearAllToasts() {
  const container = document.getElementById("toast-container");
  if (container) {
    container.remove();
  }
}
