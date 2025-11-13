import { createStore } from '@/core/store';

export const OPEN_TOAST = 'OPEN_TOAST';
export const CLOSE_TOAST = 'CLOSE_TOAST';

const initState = {
  open: false,
  type: '',
  message: '',
};

let autoCloseTimer = null;
const clearAutoCloseTimer = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
};

export const toastStore = createStore((state = { ...initState }, action = {}) => {
  switch (action.type) {
    case OPEN_TOAST:
      clearAutoCloseTimer();
      autoCloseTimer = setTimeout(() => {
        toastStore.dispatch({ type: CLOSE_TOAST });
      }, 3000);
      return { ...state, ...action.payload, open: true };
    case CLOSE_TOAST:
      clearAutoCloseTimer();
      return { ...initState };
    default:
      return state;
  }
});

export const openToast = (payload) => ({ type: OPEN_TOAST, payload });
export const closeToast = () => ({ type: CLOSE_TOAST });
