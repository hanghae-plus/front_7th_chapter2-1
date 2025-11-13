import { ToastSuccess } from "../components/toast/ToastSuccess.js";
import { ToastInfo } from "../components/toast/ToastInfo.js";
import { ToastError } from "../components/toast/ToastError.js";
import { TOAST_CONFIG } from "../constants.js";

/**
 * 토스트 컨테이너를 가져오거나 생성합니다
 * @returns {HTMLElement} 토스트 컨테이너
 */
const getToastContainer = () => {
  // 기존 컨테이너가 있으면 반환
  let container = document.querySelector(".toast-container");

  if (!container) {
    // 없으면 새로 생성
    container = document.createElement("div");
    container.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 toast-container";
    document.body.appendChild(container);
  }

  return container;
};

/**
 * 토스트를 표시합니다
 * @param {string} toastHTML - 토스트 컴포넌트의 HTML
 */
const showToast = (toastHTML) => {
  const container = getToastContainer();

  // 이미 토스트가 표시 중이면 무시
  if (container.children.length > 0) {
    return;
  }

  // 임시 div를 만들어서 HTML 문자열을 DOM으로 변환
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = toastHTML;
  const toastElement = tempDiv.firstElementChild;

  // 컨테이너에 추가
  container.appendChild(toastElement);

  // 닫기 버튼 이벤트 리스너
  const closeBtn = toastElement.querySelector("#toast-close-btn");
  const removeToast = () => {
    toastElement.remove();
    // 컨테이너에 토스트가 하나도 없으면 컨테이너도 제거
    if (container.children.length === 0) {
      container.remove();
    }
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", removeToast);
  }

  // 설정된 시간 후 자동 제거
  setTimeout(removeToast, TOAST_CONFIG.DURATION);
};

export const toast = {
  /**
   * 성공 토스트 표시
   * @param {string} message - 표시할 메시지
   */
  success: (message) => {
    showToast(ToastSuccess(message));
  },

  /**
   * 정보 토스트 표시
   * @param {string} message - 표시할 메시지
   */
  info: (message) => {
    showToast(ToastInfo(message));
  },

  /**
   * 에러 토스트 표시
   * @param {string} message - 표시할 메시지
   */
  error: (message) => {
    showToast(ToastError(message));
  },
};
