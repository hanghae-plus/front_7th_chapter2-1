/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 토스트 타입 ('success' | 'info' | 'error')
 */
export function showToast(message, type = "success") {
  // 기존 토스트가 있으면 모두 제거
  const existingContainer = document.getElementById("toast-container");
  if (existingContainer) {
    existingContainer.remove();
  }

  // 토스트 컨테이너 생성
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2";
  document.body.appendChild(toastContainer);

  // 타입별 스타일과 아이콘
  const styles = {
    success: {
      bg: "bg-green-600",
      icon: /* HTML */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `,
    },
    info: {
      bg: "bg-blue-600",
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
    error: {
      bg: "bg-red-600",
      icon: /* HTML */ `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      `,
    },
  };

  const style = styles[type] || styles.success;

  // 토스트 요소 생성
  const toast = document.createElement("div");
  toast.className = `${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm animate-slide-down`;
  toast.innerHTML = /* HTML */ `
    <div class="flex-shrink-0">${style.icon}</div>
    <p class="text-sm font-medium">${message}</p>
    <button id="toast-close-btn" class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  // 닫기 버튼 이벤트
  const closeBtn = toast.querySelector(".toast-close-btn");
  closeBtn.addEventListener("click", () => removeToast(toast));

  // 토스트 추가
  toastContainer.appendChild(toast);

  // 3초 후 자동 제거
  const timeoutId = setTimeout(() => removeToast(toast), 3000);

  // 토스트에 타이머 ID 저장 (나중에 취소할 수 있도록)
  toast.dataset.timeoutId = timeoutId;
}

/**
 * 토스트 제거
 * @param {HTMLElement} toast - 제거할 토스트 요소
 */
function removeToast(toast) {
  // 타이머 취소
  if (toast.dataset.timeoutId) {
    clearTimeout(Number(toast.dataset.timeoutId));
  }

  // fade-out 애니메이션
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-20px)";
  toast.style.transition = "all 0.3s ease-out";

  setTimeout(() => {
    toast.remove();

    // 컨테이너가 비어있으면 제거
    const container = document.getElementById("toast-container");
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}
