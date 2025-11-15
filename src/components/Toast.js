/**
 * 토스트 타입별 아이콘
 */
const ToastIcons = {
  success: /* html */ `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
  `,
  info: /* html */ `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  `,
  error: /* html */ `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  `,
};

/**
 * 토스트 타입별 스타일
 */
const ToastStyles = {
  success: "bg-green-600",
  info: "bg-blue-600",
  error: "bg-red-600",
};

/**
 * 개별 토스트 컴포넌트
 * @param {string} type - 'success' | 'info' | 'error'
 * @param {string} message - 토스트 메시지
 */
export const Toast = ({ type = "success", message }) => {
  const bgColor = ToastStyles[type] || ToastStyles.success;
  const icon = ToastIcons[type] || ToastIcons.success;

  return /* html */ `
    <div 
      id="toast" 
      class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm"
    >
      <div class="flex-shrink-0">
        ${icon}
      </div>
      <p class="text-sm font-medium flex-1">${message}</p>
      <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
};

/**
 * 토스트 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'success' | 'info' | 'error'
 * @param {number} duration - 자동 닫힘 시간 (ms), 0이면 자동으로 닫히지 않음
 */
export function showToast(message, type = "success", duration = 3000) {
  // 기존 토스트 제거
  removeToast();

  const toastHTML = Toast({ type, message });

  // 토스트 컨테이너 생성 또는 가져오기
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50";
    document.body.appendChild(container);
  }

  // 토스트 추가
  container.innerHTML = toastHTML;

  // 닫기 버튼 이벤트
  const closeBtn = document.getElementById("toast-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      removeToast();
    });
  }

  // 자동 닫힘
  if (duration > 0) {
    setTimeout(() => {
      removeToast();
    }, duration);
  }
}

/**
 * 토스트 제거 함수
 */
export function removeToast() {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.remove();
  }
}

/**
 * 모든 토스트 제거 (단일 토스트이므로 removeToast와 동일)
 */
export function clearAllToasts() {
  removeToast();
}
