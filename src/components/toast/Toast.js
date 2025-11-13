import Component from '@/core/component';
import { closeToast, toastStore } from '@/stores/toast';

const BACKGROUND_MAP = {
  success: 'bg-green-600',
  info: 'bg-blue-600',
  error: 'bg-red-600',
};

const Icons = {
  success: /* HTML */ `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 13l4 4L19 7"
      ></path>
    </svg>
  `,
  info: /* HTML */ `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  `,
  error: /* HTML */ `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  `,
};

export default class Toast extends Component {
  template() {
    const { open, type, message } = toastStore.getState();

    if (!open) return '';
    return /* HTML */ `
      <div
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center justify-center w-fit"
      >
        ${
          /* HTML */ `
            <div
              class="${BACKGROUND_MAP[
                type
              ]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm"
            >
              <div class="flex-shrink-0">${Icons[type]}</div>
              <p class="text-sm font-medium">${message}</p>
              <button
                id="toast-close-btn"
                class="flex-shrink-0 ml-2 text-white hover:text-gray-200"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          `
        }
      </div>
    `;
  }

  setEvent() {
    this.addEvent('click', '#toast-close-btn', () => {
      toastStore.dispatch(closeToast());
    });
  }
}
