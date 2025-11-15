/**
 * 모달 상태 관리
 */

let isCartModalOpen = false;
let listeners = [];

export function isModalOpen() {
  return isCartModalOpen;
}

export function openModal() {
  isCartModalOpen = true;
  document.body.style.overflow = "hidden";
  notifyListeners();
}

export function closeModal() {
  isCartModalOpen = false;
  document.body.style.overflow = "";
  notifyListeners();
}

export function toggleModal() {
  isCartModalOpen = !isCartModalOpen;
  document.body.style.overflow = isCartModalOpen ? "hidden" : "";
  notifyListeners();
}

function notifyListeners() {
  listeners.forEach((listener) => listener(isCartModalOpen));
}

export function subscribeModal(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
