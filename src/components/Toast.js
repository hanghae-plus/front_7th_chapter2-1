// Toast 타입별 설정
const toastConfig = {
  success: {
    bgColor: "bg-green-600",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`,
    defaultMessage: "장바구니에 추가되었습니다",
  },
  info: {
    bgColor: "bg-blue-600",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
    defaultMessage: "선택된 상품들이 삭제되었습니다",
  },
  error: {
    bgColor: "bg-red-600",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>`,
    defaultMessage: "오류가 발생했습니다.",
  },
};

export const Toast = () => {
  return /*html*/ `
    <div id="toast-container" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden">
      <div id="toast-content" class="flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
        <!-- Toast 내용은 동적으로 삽입됨 -->
      </div>
    </div>
    `;
};

// Toast 내용을 렌더링하는 함수
export const renderToastContent = (type = "success", message = "") => {
  const config = toastConfig[type] || toastConfig.success;
  const bgColor = config.bgColor;
  const icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return /*html*/ `
    <div class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm animate-slide-up">
      <div class="flex-shrink-0">
        ${icon}
      </div>
      <p class="text-sm font-medium">${displayMessage}</p>
      <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
};
