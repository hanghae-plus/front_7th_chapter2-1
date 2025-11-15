import { createStore } from "../core/store.js";
import { getCartStateFromStorage, saveCartStateToStorage } from "../utils/storage.js";

/**
 * 장바구니 상태 관리
 * localStorage와 자동 동기화
 */
export const cartState = createStore(getCartStateFromStorage());

// cartState 변경 시 localStorage에 자동 저장
cartState.subscribe((state) => {
  saveCartStateToStorage(state);
});
