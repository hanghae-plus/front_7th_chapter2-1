import { CartModal } from "../components/CartModal.js";
import { store } from "../state/store.js";
import { load, save } from "../core/storage.js";

// 선택된 아이템 ID 목록 (모달 내 상태)
let selectedIds = [];

// store 구독 해제 함수
let unsubscribe = null;

/**
 * 장바구니 모달 열기
 */
export function openCartModal() {
  // 이미 열려있으면 무시
  if (document.getElementById("cart-modal-container")) {
    return;
  }

  // 장바구니 상태 가져오기
  const cart = store.getState().cart;

  // 선택 상태 복원 (localStorage에서)
  const savedSelectedIds = load("cart_selected_ids") || [];
  // 현재 장바구니에 있는 상품들의 ID만 유효한 선택으로 필터링
  selectedIds = savedSelectedIds.filter((id) => cart.some((item) => item.id === id));

  // 모달 컨테이너 생성
  const modalContainer = document.createElement("div");
  modalContainer.id = "cart-modal-container";
  modalContainer.className = "fixed inset-0 z-50 bg-black bg-opacity-50";
  modalContainer.innerHTML = CartModal({ cart, selectedIds });

  // #root에 추가 (기존 내용 유지)
  const root = document.getElementById("root");
  if (root) {
    root.appendChild(modalContainer);
  }

  // body 스크롤 방지
  document.body.style.overflow = "hidden";

  // store 구독 - 장바구니 변경 시 모달 자동 업데이트
  unsubscribe = store.subscribe(() => {
    const modalContainer = document.getElementById("cart-modal-container");
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
  const modalContainer = document.getElementById("cart-modal-container");
  if (modalContainer) {
    modalContainer.remove();

    // body 스크롤 복원
    document.body.style.overflow = "";
    // store 구독 해제
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    // 선택 상태 localStorage에 저장 (새로고침 후에도 유지)
    save("cart_selected_ids", selectedIds);
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
  // localStorage에 저장
  save("cart_selected_ids", selectedIds);

  const modalContainer = document.getElementById("cart-modal-container");
  if (modalContainer) {
    const cart = store.getState().cart;
    modalContainer.innerHTML = CartModal({ cart, selectedIds });
  }
}
