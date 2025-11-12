import { store } from "../../store";

const TOASTTYPE = {
  addCart: {
    color: "green",
    icon: "M5 13l4 4L19 7",
    text: "장바구니에 추가되었습니다",
  },
  selectDelete: {
    color: "blue",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    text: "선택된 상품들이 삭제되었습니다",
  },
  allDelete: {
    color: "blue",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    text: "장바구니가 비워졌습니다",
  },
  error: {
    color: "red",
    icon: "M6 18L18 6M6 6l12 12",
    text: "오류가 발생했습니다.",
  },
};

export const Toast = () => {
  const toasState = store.state.toastState;

  return `
  <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] toast-container animate-slide-up">
    <div class="bg-${TOASTTYPE[toasState].color}-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${TOASTTYPE[toasState].icon}"/>
        </svg>
      </div>
      <p class="text-sm font-medium">${TOASTTYPE[toasState].text}</p>
      <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>
  `;
};
