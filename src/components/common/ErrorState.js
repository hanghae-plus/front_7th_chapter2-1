// src/components/common/ErrorState.js
export default function ErrorState({
  message = "상품을 불러오는데 실패했습니다",
  description = "네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.",
  buttonText = "다시 시도",
  buttonId = "retry-btn",
  showButton = true,
}) {
  return /*html*/ `
    <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        ${message}
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        ${description}
      </p>
      ${
        showButton
          ? `
        <button
          id="${buttonId}"
          class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          ${buttonText}
        </button>
      `
          : ""
      }
    </div>
  `;
}
