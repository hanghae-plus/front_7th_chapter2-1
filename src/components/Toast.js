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
 * @param {string} id - 토스트 고유 ID
 */
export const Toast = ({ type = "success", message, id }) => {
  const bgColor = ToastStyles[type] || ToastStyles.success;
  const icon = ToastIcons[type] || ToastIcons.success;

  return /* html */ `
    <div 
      id="toast-${id}" 
      class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm
             transform transition-all duration-300 ease-in-out toast-item"
      style="animation: slideUp 0.3s ease-out;"
    >
      <div class="flex-shrink-0">
        ${icon}
      </div>
      <p class="text-sm font-medium flex-1">${message}</p>
      <button class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200" data-toast-id="${id}">
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
  const id = Date.now().toString();
  const toastHTML = Toast({ type, message, id });

  // 토스트 컨테이너 생성 또는 가져오기
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center";
    document.body.appendChild(container);
  }

  // 토스트 추가
  const toastWrapper = document.createElement("div");
  toastWrapper.innerHTML = toastHTML;
  const toastElement = toastWrapper.firstElementChild;
  container.appendChild(toastElement);

  // 닫기 버튼 이벤트
  const closeBtn = toastElement.querySelector(".toast-close-btn");
  closeBtn.addEventListener("click", () => {
    removeToast(id);
  });

  // 자동 닫힘
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

/**
 * 토스트 제거 함수
 * @param {string} id - 토스트 ID
 */
export function removeToast(id) {
  const toast = document.getElementById(`toast-${id}`);
  if (toast) {
    // 애니메이션 추가
    toast.style.animation = "slideDown 0.3s ease-in";
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

/**
 * 모든 토스트 제거
 */
export function clearAllToasts() {
  const container = document.getElementById("toast-container");
  if (container) {
    container.remove();
  }
}
