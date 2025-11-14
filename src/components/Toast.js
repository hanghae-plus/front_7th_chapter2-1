// 토스트 컴포넌트
const ToastComponent = ({ message, type = "success" }) => {
  const configs = {
    success: {
      bgColor: "bg-green-600",
      icon: /* html */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `,
    },
    info: {
      bgColor: "bg-blue-600",
      icon: /* html */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
    },
    error: {
      bgColor: "bg-red-600",
      icon: /* html */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `,
    },
  };

  const config = configs[type] || configs.success;

  return /* html */ `
    <div class="${config.bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm animate-slide-up">
      <div class="flex-shrink-0">
        ${config.icon}
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
};

// 토스트 컨테이너 관리
let toastContainer = null;

const initToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2";
    toastContainer.style.cssText = "pointer-events: none;";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// 토스트 제거 함수
const removeToast = (toastElement) => {
  if (toastElement && toastElement.parentNode) {
    toastElement.style.opacity = "0";
    toastElement.style.transform = "translateY(-20px)";
    toastElement.style.transition = "all 0.3s ease-out";

    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.remove();
      }
    }, 300);
  }
};

// 토스트 표시 함수
const createToast = (message, type = "success") => {
  const container = initToastContainer();

  // 토스트 생성
  const toastWrapper = document.createElement("div");
  toastWrapper.style.cssText = "pointer-events: auto;";
  toastWrapper.innerHTML = ToastComponent({ message, type });

  container.appendChild(toastWrapper);

  // 닫기 버튼 이벤트
  const closeBtn = toastWrapper.querySelector(".toast-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => removeToast(toastWrapper));
  }

  setTimeout(() => removeToast(toastWrapper), 3000);
};

export const showToast = {
  success: (message) => createToast(message, "success"),
  info: (message) => createToast(message, "info"),
  error: (message) => createToast(message, "error"),
};
