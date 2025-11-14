export const Error = () => {
  return html`
    <div class="flex flex-1 flex-col items-center justify-center px-4 py-3 gap-8">
      <div class="text-red-500">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-xl font-medium">오류가 발생했습니다.</p>
      <button id="error-retry-btn" class="rounded-md bg-blue-500 text-white px-4 py-2">다시 시도</button>
    </div>
  `;
};
