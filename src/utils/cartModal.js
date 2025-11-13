import { CartModal } from "../components/CartModal.js";
import { store } from "../state/store.js";

// 선택된 아이템 ID 목록 (모달 내 상태)
let selectedIds = [];

// store 구독 해제 함수
let unsubscribe = null;

/**
 * 장바구니 모달 열기
 */
export function openCartModal() {
  // 이미 열려있으면 무시
  if (document.getElementById("cart-modal")) {
    return;
  }

  // 선택 상태 초기화
  selectedIds = [];

  // 장바구니 상태 가져오기
  const cart = store.getState().cart;

  // 모달 컨테이너 생성
  const modalContainer = document.createElement("div");
  modalContainer.id = "cart-modal";
  modalContainer.className = "fixed inset-0 z-50 bg-black bg-opacity-50";
  modalContainer.innerHTML = CartModal({ cart, selectedIds });

  // body에 추가
  document.body.appendChild(modalContainer);

  // body 스크롤 방지
  document.body.style.overflow = "hidden";

  // store 구독 - 장바구니 변경 시 모달 자동 업데이트
  unsubscribe = store.subscribe(() => {
    const modalContainer = document.getElementById("cart-modal");
    if (modalContainer) {
      const cart = store.getState().cart;
      modalContainer.innerHTML = CartModal({ cart, selectedIds });
    }
  });
}

/**
 * 장바구니 모달 닫기
 */
export function closeCartModal() {
  const modalContainer = document.getElementById("cart-modal");
  if (modalContainer) {
    modalContainer.remove();
    // body 스크롤 복원
    document.body.style.overflow = "";
    // store 구독 해제
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    // 선택 상태 초기화
    selectedIds = [];
  }
}

/**
 * 선택된 아이템 ID 가져오기
 */
export function getSelectedIds() {
  return selectedIds;
}

/**
 * 선택된 아이템 ID 설정 및 모달 업데이트
 */
export function setSelectedIds(newSelectedIds) {
  selectedIds = newSelectedIds;
  const modalContainer = document.getElementById("cart-modal");
  if (modalContainer) {
    const cart = store.getState().cart;
    modalContainer.innerHTML = CartModal({ cart, selectedIds });
  }
}
