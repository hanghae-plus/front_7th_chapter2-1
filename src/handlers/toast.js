import { AddToCartToast } from "../components/toast/AddCartToast";

let toastTimeout = null;

/**
 * Toast 메시지 표시
 */
export function showToast() {
  const toastContainer = document.getElementById("toast");
  if (!toastContainer) return;

  // 기존 타이머가 있으면 취소
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  // Toast 내용 추가 (애니메이션 클래스 포함)
  toastContainer.innerHTML = `
    <div class="animate-slide-up">
      ${AddToCartToast}
    </div>
  `;

  // 닫기 버튼 이벤트
  const closeBtn = document.getElementById("toast-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideToast);
  }

  // 3초 후 자동으로 사라지기
  toastTimeout = setTimeout(() => {
    hideToast();
  }, 3000);
}

/**
 * Toast 제거
 */
function hideToast() {
  const toastContainer = document.getElementById("toast");
  if (!toastContainer) return;

  const toastContent = toastContainer.firstElementChild;
  if (toastContent) {
    // slide-down 애니메이션 시작
    toastContent.classList.remove("animate-slide-up");
    toastContent.classList.add("animate-slide-down");

    // 애니메이션 완료 후 DOM에서 제거
    setTimeout(() => {
      toastContainer.innerHTML = "";
    }, 300); // 애니메이션 시간 (0.3s)
  }

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
}
