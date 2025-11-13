/**
 * 토스트 메시지 타입 정의
 */
export const TOAST_TYPES = {
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
