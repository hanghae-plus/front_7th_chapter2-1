import { toastStore } from "../Store/toast.js";
import { toastUI } from "../components/common/toastUI.js";

/**
 * 토스트 메시지 렌더링 + 이벤트 리스너 등록
 */
export function renderToast() {
  const modalContainer = document.getElementById("modal-container"); // Use modal-container for toasts
  if (!modalContainer) {
    console.error("Toast container not found.");
    return;
  }

  const { message, type, isVisible } = toastStore.getState();

  if (isVisible) {
    // 토스트가 표시될 때만 렌더링
    modalContainer.insertAdjacentHTML(
      "beforeend",
      `
      <div id="toast-wrapper" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        ${toastUI({ message, type })}
      </div>
    `,
    );
    // 닫기 버튼 이벤트 리스너 부착
    const closeBtn = document.getElementById("toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toastStore.hideToast();
      });
    }
  } else {
    // 토스트가 숨겨질 때 DOM에서 제거
    const toastWrapper = document.getElementById("toast-wrapper");
    if (toastWrapper) {
      toastWrapper.remove();
    }
  }
}

// toastStore 구독: 토스트 상태 변경 시 토스트를 다시 렌더링
toastStore.subscribe(renderToast);
