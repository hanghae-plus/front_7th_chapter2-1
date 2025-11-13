/**
 * Toast 알림 관리 유틸리티
 * 사용자에게 알림 메시지를 표시합니다.
 */

/**
 * Toast 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - Toast 타입 ('success', 'info', 'error')
 * @param {number} duration - 표시 시간 (밀리초, 기본값: 3000)
 */
export const showToast = (message, type = "success", duration = 3000) => {
  // 기존 Toast 제거
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  // Toast 타입별 스타일 설정
  const styles = {
    success: {
      bgColor: "bg-green-600",
      icon: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `,
    },
    info: {
      bgColor: "bg-blue-600",
      icon: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `,
    },
    error: {
      bgColor: "bg-red-600",
      icon: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      `,
    },
  };

  const style = styles[type] || styles.success;

  // Toast 엘리먼트 생성
  const toast = document.createElement("div");
  toast.className = "toast-notification fixed left-1/2 transform -translate-x-1/2 z-50 animate-slide-up-from-bottom";
  toast.style.bottom = "20px";
  toast.innerHTML = `
    <div class="${style.bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        ${style.icon}
      </div>
      <p class="text-sm font-medium">${message}</p>
      <button id="toast-close-btn" class="toast-close-btn flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  // 스타일 추가 (애니메이션)
  if (!document.querySelector("#toast-styles")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "toast-styles";
    styleSheet.textContent = `
      @keyframes slide-up-from-bottom {
        from {
          opacity: 0;
          transform: translate(-50%, 20px);
        }
        to {
          opacity: 1;
          transform: translate(-50%, 0);
        }
      }
      
      @keyframes slide-down-to-bottom {
        from {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        to {
          opacity: 0;
          transform: translate(-50%, 20px);
        }
      }
      
      .animate-slide-up-from-bottom {
        animation: slide-up-from-bottom 0.3s ease-out;
      }
      
      .animate-slide-down-to-bottom {
        animation: slide-down-to-bottom 0.3s ease-out;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Toast를 body에 추가
  document.body.appendChild(toast);

  // 닫기 버튼 이벤트
  const closeBtn = toast.querySelector(".toast-close-btn");
  closeBtn.addEventListener("click", () => {
    removeToast(toast);
  });

  // 자동 제거 (duration이 0이면 자동으로 사라지지 않음)
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }
};

/**
 * Toast 제거 (애니메이션과 함께)
 * @param {HTMLElement} toast - 제거할 Toast 엘리먼트
 */
const removeToast = (toast) => {
  if (!toast || !toast.parentNode) return;

  toast.classList.remove("animate-slide-up-from-bottom");
  toast.classList.add("animate-slide-down-to-bottom");

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 300);
};

/**
 * 성공 메시지 표시 (편의 함수)
 * @param {string} message - 메시지
 */
export const showSuccessToast = (message) => {
  showToast(message, "success");
};

/**
 * 정보 메시지 표시 (편의 함수)
 * @param {string} message - 메시지
 */
export const showInfoToast = (message) => {
  showToast(message, "info");
};

/**
 * 에러 메시지 표시 (편의 함수)
 * @param {string} message - 메시지
 */
export const showErrorToast = (message) => {
  showToast(message, "error");
};
