const Toast = ({ type = "success", message }) => {
  const configs = {
    success: {
      bgColor: "bg-green-600",
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>`,
    },
    info: {
      bgColor: "bg-blue-600",
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    },
    error: {
      bgColor: "bg-red-600",
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`,
    },
  };

  const config = configs[type] || configs.success;

  return `
    <div class="${config.bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${config.icon}
        </svg>
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
};

const ToastDemo = () => {
  return `
    <div class="flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
      ${Toast({ type: "success", message: "장바구니에 추가되었습니다" })}
      ${Toast({ type: "info", message: "선택된 상품들이 삭제되었습니다" })}
      ${Toast({ type: "error", message: "오류가 발생했습니다." })}
    </div>
  `;
};

export { Toast, ToastDemo };
