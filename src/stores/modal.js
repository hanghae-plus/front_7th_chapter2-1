import { createStore } from '@/core/store';

export const OPEN_MODAL = 'OPEN_MODAL';
export const CLOSE_MODAL = 'CLOSE_MODAL';

const initState = { open: false };

export const modalStore = createStore((state = { ...initState }, action = {}) => {
  switch (action.type) {
    case OPEN_MODAL:
      return { ...state, open: true };
    case CLOSE_MODAL:
      return { ...initState };
    default:
      return state;
  }
});

export const openModal = () => ({ type: OPEN_MODAL });
export const closeModal = () => ({ type: CLOSE_MODAL });
