import { store } from "../../store";
import { TOAST_TYPES } from "../constants/toastTypes.js";

export const Toast = () => {
  const toastState = store.state.toastState;

  if (!toastState || !TOAST_TYPES[toastState]) {
    return "";
  }

  const toastConfig = TOAST_TYPES[toastState];

  return `
  <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] toast-container animate-slide-up">
    <div class="bg-${toastConfig.color}-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${toastConfig.icon}"/>
        </svg>
      </div>
      <p class="text-sm font-medium">${toastConfig.text}</p>
      <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  </div>
  `;
};
