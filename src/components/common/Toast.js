// Toast 타입별 설정
const TOAST_CONFIG = {
  SUCCESS: {
    bgColor: "bg-green-600",
    icon: /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    `,
  },
  INFO: {
    bgColor: "bg-blue-600",
    icon: /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    `,
  },
  ERROR: {
    bgColor: "bg-red-600",
    icon: /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `,
  },
};

const TOAST_ROOT_ID = "toast-root";
const DEFAULT_DURATION = 3000;

// Toast 템플릿
const createToastTemplate = ({ type, message }) => {
  const config = TOAST_CONFIG[type];
  if (!config) {
    console.warn(`Unknown toast type: ${type}`);
    return "";
  }

  return /* HTML */ `
    <div class="toast-wrapper flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
      <div
        class="${config.bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm animate-fade-in"
      >
        <div class="flex-shrink-0">${config.icon}</div>
        <p class="text-sm font-medium">${message}</p>
        <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
};

// Toast Root 요소 초기화
const initToastRoot = () => {
  let toastRoot = document.getElementById(TOAST_ROOT_ID);
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.id = TOAST_ROOT_ID;
    toastRoot.className = "fixed bottom-5 w-screen flex justify-center z-50";
    document.body.appendChild(toastRoot);
  }
  return toastRoot;
};

// Toast 싱글톤 인스턴스
const createToast = () => {
  let currentTimeoutId = null;
  let currentCloseHandler = null;

  const show = (type, message, duration = DEFAULT_DURATION) => {
    const toastRoot = initToastRoot();

    // 기존 Toast 정리
    hide();

    // 새 Toast 렌더링
    toastRoot.innerHTML = createToastTemplate({ type, message });

    // 닫기 버튼 이벤트 등록
    currentCloseHandler = () => hide();
    const closeBtn = toastRoot.querySelector(".toast-close-btn");
    closeBtn?.addEventListener("click", currentCloseHandler);

    // 자동 닫힘 타이머 설정
    if (duration > 0) {
      currentTimeoutId = setTimeout(() => {
        hide();
      }, duration);
    }
  };

  const hide = () => {
    const toastRoot = document.getElementById(TOAST_ROOT_ID);
    if (!toastRoot) return;

    // 타이머 정리
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
      currentTimeoutId = null;
    }

    // 이벤트 리스너 정리
    if (currentCloseHandler) {
      const closeBtn = toastRoot.querySelector(".toast-close-btn");
      closeBtn?.removeEventListener("click", currentCloseHandler);
      currentCloseHandler = null;
    }

    // Toast 제거
    toastRoot.innerHTML = "";
  };

  return { show, hide };
};

// 전역 Toast 인스턴스
const Toast = createToast();

export default Toast;
